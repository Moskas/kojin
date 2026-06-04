import path from 'path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeHighlight from 'rehype-highlight'
import type { Root } from 'mdast'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import { upsertBacklink, getBacklinks } from '../db/index'

export interface NoteFrontmatter {
  title: string
  tags?: string[]
  created?: string
  updated?: string
}

export interface Note {
  frontmatter: NoteFrontmatter
  html: string
  slug: string
  filename: string
  backlinks: string[]
}

// Transforms [[note-slug]] and [[note-slug|display text]] into links
const wikiLinksPlugin: Plugin<[{ sourceSlug: string }], Root> = ({ sourceSlug }) => {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      const WIKI_LINK = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g
      const text = node.value
      let match
      let lastIndex = 0
      const newNodes: typeof node[] = []

      while ((match = WIKI_LINK.exec(text)) !== null) {
        if (match.index > lastIndex) {
          newNodes.push({ type: 'text', value: text.slice(lastIndex, match.index) })
        }

        const targetSlug = match[1].trim()
        const displayText = match[2]?.trim() ?? match[1].trim()

        newNodes.push({
          type: 'link',
          url: `/garden/${targetSlug}`,
          children: [{ type: 'text', value: displayText }],
        } as any)

        upsertBacklink(sourceSlug, targetSlug)
        lastIndex = match.index + match[0].length
      }

      if (newNodes.length === 0) return
      if (lastIndex < text.length) {
        newNodes.push({ type: 'text', value: text.slice(lastIndex) })
      }

      parent!.children.splice(index!, 1, ...newNodes)
    })
  }
}

function makeProcessor(sourceSlug: string) {
  return unified()
    .use(remarkParse)
    .use(wikiLinksPlugin, { sourceSlug })
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeStringify)
}

function fileToSlug(filename: string): string {
  return path.basename(filename, '.md')
}

async function parseNote(filePath: string): Promise<Note> {
  const source = await Bun.file(filePath).text()
  const { data, content } = matter(source)
  const filename = path.basename(filePath)
  const slug = fileToSlug(filename)

  const result = await makeProcessor(slug).process(content)
  const backlinks = getBacklinks(slug)

  return {
    frontmatter: data as NoteFrontmatter,
    html: String(result),
    slug,
    filename,
    backlinks,
  }
}

export async function listNotes(dir: string): Promise<Note[]> {
  const glob = new Bun.Glob('*.md')
  const files = [...glob.scanSync(dir)].sort()
  return Promise.all(files.map((f) => parseNote(`${dir}/${f}`)))
}

export async function loadNote(dir: string, slug: string): Promise<Note | null> {
  const filePath = `${dir}/${slug}.md`
  const file = Bun.file(filePath)
  if (!(await file.exists())) return null
  return parseNote(filePath)
}

export interface BacklinkEntry {
  slug: string
  title: string
}

export async function resolveBacklinks(dir: string, slugs: string[]): Promise<BacklinkEntry[]> {
  const entries: BacklinkEntry[] = []
  for (const slug of slugs) {
    const filePath = `${dir}/${slug}.md`
    const file = Bun.file(filePath)
    if (!(await file.exists())) continue
    const { data } = matter(await file.text())
    entries.push({ slug, title: (data.title as string) ?? slug })
  }
  return entries
}
