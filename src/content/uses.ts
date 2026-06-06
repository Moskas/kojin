import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

const HARDWARE_DIR = `${process.cwd()}/content/uses/hardware`
const SOFTWARE_DIR = `${process.cwd()}/content/uses/software`

export interface HardwareItem {
  id: string
  name: string
  bodyHtml: string
}

export interface SoftwareItem {
  id: string
  name: string
  url?: string
  bodyHtml: string
}

export interface UsesData {
  hardware: HardwareItem[]
  software: SoftwareItem[]
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const processor = unified().use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeStringify)

async function parseItem(filePath: string): Promise<{ id: string; name: string; url?: string; bodyHtml: string }> {
  const source = await Bun.file(filePath).text()
  const { data, content } = matter(source)
  const result = await processor.process(content)
  return {
    id: slugify(data.name ?? ''),
    name: data.name ?? '',
    url: data.url,
    bodyHtml: String(result),
  }
}

export async function loadUses(): Promise<UsesData> {
  const glob = new Bun.Glob('*.md')

  const hardwareFiles = [...glob.scanSync(HARDWARE_DIR)].sort()
  const softwareFiles = [...glob.scanSync(SOFTWARE_DIR)].sort()

  const [hardware, software] = await Promise.all([
    Promise.all(hardwareFiles.map((f) => parseItem(`${HARDWARE_DIR}/${f}`))),
    Promise.all(softwareFiles.map((f) => parseItem(`${SOFTWARE_DIR}/${f}`))),
  ])

  return { hardware, software }
}
