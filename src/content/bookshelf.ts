import { readdirSync } from 'node:fs'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

const BOOKSHELF_DIR = `${process.cwd()}/content/bookshelf`

export type BookStatus = 'reading' | 'finished' | 'hold'

export interface BookshelfEntry {
  id: string
  title: string
  author: string
  cover?: string
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
  return {
    id: slugify(data.title ?? ''),
    title: data.title ?? '',
    author: data.author ?? '',
    cover: data.cover,
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
