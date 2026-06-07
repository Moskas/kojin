import { readdirSync } from 'node:fs'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

const USES_DIR = `${process.cwd()}/content/uses`

export interface UsesItem {
  id: string
  name: string
  url?: string
  order: number
  bodyHtml: string
}

export interface UsesSection {
  id: string
  title: string
  order: number
  layout: 'list' | 'grid'
  items: UsesItem[]
}

export type UsesData = UsesSection[]

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function parseMetaYaml(src: string): { title?: string; order?: number; layout?: 'list' | 'grid' } {
  const m = (re: RegExp) => src.match(re)
  const rawOrder = Number(m(/^order:\s*(\d+)/m)?.[1])
  return {
    title: m(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1]?.trim(),
    order: !isNaN(rawOrder) && rawOrder > 0 ? rawOrder : undefined,
    layout: (m(/^layout:\s*(list|grid)/m)?.[1] as 'list' | 'grid') ?? undefined,
  }
}

const processor = unified().use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeStringify)

async function parseItem(filePath: string): Promise<UsesItem> {
  const source = await Bun.file(filePath).text()
  const { data, content } = matter(source)
  const result = await processor.process(content)
  const rawOrder = Number(data.order)
  return {
    id: slugify(data.name ?? ''),
    name: data.name ?? '',
    url: data.url,
    order: !isNaN(rawOrder) ? rawOrder : Infinity,
    bodyHtml: String(result),
  }
}

async function loadSection(dirName: string): Promise<UsesSection> {
  const dirPath = `${USES_DIR}/${dirName}`
  const metaFile = Bun.file(`${dirPath}/_meta.yaml`)

  let title = dirName
  let order: number = Infinity
  let layout: 'list' | 'grid' = 'list'

  if (await metaFile.exists()) {
    const parsed = parseMetaYaml(await metaFile.text())
    if (parsed.title) title = parsed.title
    if (parsed.order !== undefined) order = parsed.order
    if (parsed.layout) layout = parsed.layout
  }

  const glob = new Bun.Glob('*.md')
  const files = [...glob.scanSync(dirPath)]
  const items = await Promise.all(files.map((f) => parseItem(`${dirPath}/${f}`)))

  items.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order
    return a.name.localeCompare(b.name)
  })

  return { id: slugify(dirName), title, order, layout, items }
}

export async function loadUses(): Promise<UsesData> {
  const dirNames = readdirSync(USES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)

  const sections = await Promise.all(dirNames.map(loadSection))

  sections.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order
    return a.id.localeCompare(b.id)
  })

  return sections
}
