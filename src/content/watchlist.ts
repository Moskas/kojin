import { readdirSync } from 'node:fs'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

const WATCHLIST_DIR = `${process.cwd()}/content/watchlist`

export type WatchStatus = 'watching' | 'finished' | 'plan' | 'dropped'

export interface WatchEntry {
  id: string
  title: string
  director?: string
  creator?: string
  status: WatchStatus
  rating: number
  year?: number
  seasons?: number
  cover?: string
  link?: string
  order: number
  writeupHtml: string
}

export interface WatchSection {
  id: string
  title: string
  order: number
  entries: WatchEntry[]
}

export interface WatchQuery {
  filter: WatchStatus | 'all'
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

async function parseEntry(filePath: string): Promise<WatchEntry> {
  const source = await Bun.file(filePath).text()
  const { data, content } = matter(source)
  const result = await processor.process(content)
  const rawOrder = Number(data.order)
  const rawRating = Number(data.rating)
  const rawYear = Number(data.year)
  const rawSeasons = Number(data.seasons)

  return {
    id: slugify(data.title ?? ''),
    title: data.title ?? '',
    director: data.director,
    creator: data.creator,
    status: (data.status as WatchStatus) ?? 'plan',
    rating: !isNaN(rawRating) ? Math.min(10, Math.max(0, rawRating)) : 0,
    year: !isNaN(rawYear) && rawYear > 0 ? rawYear : undefined,
    seasons: !isNaN(rawSeasons) && rawSeasons > 0 ? rawSeasons : undefined,
    cover: data.cover,
    link: data.link,
    order: !isNaN(rawOrder) ? rawOrder : Infinity,
    writeupHtml: String(result),
  }
}

async function loadSection(dirName: string): Promise<WatchSection> {
  const dirPath = `${WATCHLIST_DIR}/${dirName}`
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

export async function loadWatchlist(query: WatchQuery): Promise<WatchSection[]> {
  const dirNames = readdirSync(WATCHLIST_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)

  const sections = await Promise.all(dirNames.map(loadSection))
  sections.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order
    return a.id.localeCompare(b.id)
  })

  return sections.map((section) => {
    let entries = section.entries.filter((e) => {
      if (query.filter !== 'all' && e.status !== query.filter) return false
      return true
    })

    return { ...section, entries }
  })
}
