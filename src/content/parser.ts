import path from 'path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import { visit } from 'unist-util-visit'

export interface Frontmatter {
  title: string
  date: string | Date
  updated?: string | Date
  tags?: string[]
  draft?: boolean
  description?: string
}

export type TocItem = { depth: number; id: string; text: string }

export interface ParsedContent {
  frontmatter: Frontmatter
  html: string
  slug: string
  filename: string
  headings: TocItem[]
}

function collectHeadings() {
  return (tree: any, file: any) => {
    const headings: TocItem[] = []
    visit(tree, 'element', (node: any) => {
      if (/^h[1-4]$/.test(node.tagName) && node.properties?.id) {
        const text = (node.children as any[])
          .filter((c) => c.type === 'text')
          .map((c) => c.value)
          .join('')
        headings.push({ depth: parseInt(node.tagName[1]), id: node.properties.id, text })
      }
    })
    file.data.headings = headings
  }
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeHighlight)
  .use(rehypeSlug)
  .use(collectHeadings)
  .use(rehypeStringify)

function fileToSlug(filename: string): string {
  return path.basename(filename, '.md').replace(/^\d{4}-\d{2}-\d{2}-/, '')
}

async function parseFile(filePath: string): Promise<ParsedContent> {
  const source = await Bun.file(filePath).text()
  const { data, content } = matter(source)
  const result = await processor.process(content)
  const filename = path.basename(filePath)

  return {
    frontmatter: data as Frontmatter,
    html: String(result),
    slug: fileToSlug(filename),
    filename,
    headings: (result.data.headings as TocItem[]) ?? [],
  }
}

export async function listPosts(dir: string): Promise<ParsedContent[]> {
  const glob = new Bun.Glob('*.md')
  const files = [...glob.scanSync(dir)].sort().reverse()

  const posts = await Promise.all(files.map((f) => parseFile(`${dir}/${f}`)))
  return posts.filter((p) => !p.frontmatter.draft)
}

export async function loadMarkdownFile(filePath: string): Promise<string> {
  const file = Bun.file(filePath)
  if (!(await file.exists())) return ''
  const { content } = matter(await file.text())
  return String(await processor.process(content))
}

export async function loadPost(dir: string, slug: string): Promise<ParsedContent | null> {
  const glob = new Bun.Glob('*.md')
  const files = [...glob.scanSync(dir)]
  const match = files.find((f) => fileToSlug(f) === slug)
  if (!match) return null
  return parseFile(`${dir}/${match}`)
}
