import matter from 'gray-matter'
import { clearSearchIndex, clearBacklinks, indexContent, upsertBacklink } from '../db/index'

const BLOG_DIR = `${process.cwd()}/content/blog`
const GARDEN_DIR = `${process.cwd()}/content/garden`
const WIKI_LINK = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g

async function slugsInDir(dir: string, pattern: string): Promise<string[]> {
  const glob = new Bun.Glob(pattern)
  return [...glob.scanSync(dir)].sort()
}

function fileToSlug(filename: string): string {
  return filename.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '')
}

export async function buildIndexes(): Promise<void> {
  clearSearchIndex()
  clearBacklinks()

  const blogFiles = await slugsInDir(BLOG_DIR, '*.md')
  for (const file of blogFiles) {
    const source = await Bun.file(`${BLOG_DIR}/${file}`).text()
    const { data, content } = matter(source)
    if (data.draft) continue
    indexContent(fileToSlug(file), data.title ?? file, content, 'blog')
  }

  const gardenFiles = await slugsInDir(GARDEN_DIR, '*.md')
  for (const file of gardenFiles) {
    const source = await Bun.file(`${GARDEN_DIR}/${file}`).text()
    const { data, content } = matter(source)
    const slug = file.replace(/\.md$/, '')
    indexContent(slug, data.title ?? slug, content, 'garden')

    let m
    WIKI_LINK.lastIndex = 0
    while ((m = WIKI_LINK.exec(content)) !== null) {
      upsertBacklink(slug, m[1].trim())
    }
  }
}
