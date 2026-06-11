import { readdirSync } from 'node:fs'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

const BOOKSHELF_DIR = `${process.cwd()}/content/bookshelf`

const ANILIST_API = 'https://graphql.anilist.co'
const anilistCoverCache = new Map<number, string>()

const MANGA_COVER_QUERY = `
  query ($ids: [Int]) {
    Page(perPage: 50) {
      media(id_in: $ids, type: MANGA) {
        id
        coverImage { large }
      }
    }
  }
`

function extractAnilistId(link: string | undefined): number | null {
  if (!link) return null
  const m = link.match(/anilist\.co\/manga\/(\d+)/)
  return m ? parseInt(m[1], 10) : null
}

async function fetchAnilistCovers(ids: number[]): Promise<void> {
  if (ids.length === 0) return
  try {
    const res = await fetch(ANILIST_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query: MANGA_COVER_QUERY, variables: { ids } }),
    })
    if (!res.ok) return
    const json = await res.json() as any
    for (const item of json.data?.Page?.media ?? []) {
      if (item.id && item.coverImage?.large) {
        anilistCoverCache.set(item.id, item.coverImage.large)
      }
    }
  } catch {
    // on failure entries stay cover-less; placeholder renders
  }
}

export type BookStatus = 'reading' | 'finished' | 'hold'

export interface BookshelfEntry {
  id: string
  title: string
  altTitle?: string
  author: string
  cover?: string
  isbn?: string
  link?: string
  status: BookStatus
  rating: number
  order: number
  writeupHtml: string
}

export interface BookshelfSection {
  id: string
  title: string
  order: number
  entries: BookshelfEntry[]
}

export interface BookshelfQuery {
  filter: BookStatus | 'all'
  sort: 'rating' | 'title'
  q: string
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function parseMetaYaml(src: string): { title?: string; order?: number } {
  const m = (re: RegExp) => src.match(re)
  const rawOrder = Number(m(/^order:\s*(\d+)/m)?.[1])
  return {
    title: m(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1]?.trim(),
    order: !isNaN(rawOrder) && rawOrder > 0 ? rawOrder : undefined,
  }
}

const processor = unified().use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeStringify)

async function parseEntry(filePath: string): Promise<BookshelfEntry> {
  const source = await Bun.file(filePath).text()
  const { data, content } = matter(source)
  const result = await processor.process(content)
  const rawOrder = Number(data.order)
  const rawRating = Number(data.rating)
  const isbn: string | undefined = data.isbn
  let cover: string | undefined = data.cover
  if (!cover && isbn) {
    cover = `https://covers.openlibrary.org/b/isbn/${isbn.replace(/[-\s]/g, '')}-L.jpg`
  }

  return {
    id: slugify(data.title ?? ''),
    title: data.title ?? '',
    altTitle: data['alt-title'] ?? data.altTitle,
    author: data.author ?? '',
    cover,
    isbn,
    link: data.link,
    status: (data.status as BookStatus) ?? 'reading',
    rating: !isNaN(rawRating) ? Math.min(10, Math.max(0, rawRating)) : 0,
    order: !isNaN(rawOrder) ? rawOrder : Infinity,
    writeupHtml: String(result),
  }
}

async function loadSection(dirName: string): Promise<BookshelfSection> {
  const dirPath = `${BOOKSHELF_DIR}/${dirName}`
  const metaFile = Bun.file(`${dirPath}/_meta.yaml`)

  let title = dirName
  let order = Infinity

  if (await metaFile.exists()) {
    const parsed = parseMetaYaml(await metaFile.text())
    if (parsed.title) title = parsed.title
    if (parsed.order !== undefined) order = parsed.order
  }

  const glob = new Bun.Glob('*.md')
  const files = [...glob.scanSync(dirPath)]
  const entries = await Promise.all(files.map((f) => parseEntry(`${dirPath}/${f}`)))

  entries.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order
    return a.title.localeCompare(b.title)
  })

  return { id: slugify(dirName), title, order, entries }
}

export async function loadBookshelf(query: BookshelfQuery): Promise<BookshelfSection[]> {
  const dirNames = readdirSync(BOOKSHELF_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)

  const sections = await Promise.all(dirNames.map(loadSection))
  sections.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order
    return a.id.localeCompare(b.id)
  })

  const needsFetch: { entry: BookshelfEntry; id: number }[] = []
  for (const section of sections) {
    for (const entry of section.entries) {
      if (!entry.cover) {
        const id = extractAnilistId(entry.link)
        if (id !== null) {
          if (anilistCoverCache.has(id)) {
            entry.cover = anilistCoverCache.get(id)
          } else {
            needsFetch.push({ entry, id })
          }
        }
      }
    }
  }
  if (needsFetch.length > 0) {
    const uniqueIds = [...new Set(needsFetch.map((x) => x.id))]
    await fetchAnilistCovers(uniqueIds)
    for (const { entry, id } of needsFetch) {
      const url = anilistCoverCache.get(id)
      if (url) entry.cover = url
    }
  }

  const needle = query.q.trim().toLowerCase()

  return sections.map((section) => {
    let entries = section.entries.filter((e) => {
      if (query.filter !== 'all' && e.status !== query.filter) return false
      if (needle) {
        const hay = (e.title + ' ' + e.author).toLowerCase()
        return hay.includes(needle)
      }
      return true
    })

    if (query.sort === 'title') {
      entries = [...entries].sort((a, b) => a.title.localeCompare(b.title))
    } else {
      entries = [...entries].sort((a, b) => b.rating - a.rating)
    }

    return { ...section, entries }
  })
}
