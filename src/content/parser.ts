import path from 'path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeHighlight from 'rehype-highlight'

export interface Frontmatter {
  title: string
  date: string
  tags?: string[]
  draft?: boolean
  description?: string
}

export interface ParsedContent {
  frontmatter: Frontmatter
  html: string
  slug: string
  filename: string
}

const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeHighlight)
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
