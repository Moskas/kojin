import path from 'path'
import { existsSync, readFileSync } from 'fs'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import { remarkAlerts } from './alerts'
import rehypeStringify from 'rehype-stringify'
import rehypeHighlight from 'rehype-highlight'
import type { Root } from 'mdast'
import type { Plugin } from 'unified'
import { visit, SKIP } from 'unist-util-visit'
import { toString } from 'mdast-util-to-string'
import { upsertBacklink, getBacklinks } from '../db/index'

export type NoteStatus = 'draft' | 'wip' | 'complete'

export const NOTE_STATUSES: NoteStatus[] = ['draft', 'wip', 'complete']

export interface NoteFrontmatter {
  title: string
  tags?: string[]
  created?: string
  updated?: string
  status?: NoteStatus
  description?: string
}

export interface Note {
  frontmatter: NoteFrontmatter
  html: string
  slug: string
  filename: string
  backlinks: string[]
  status: NoteStatus
  tended?: string
  excerpt: string
  readingMinutes: number
}

export interface GardenQuery {
  status: NoteStatus | 'all'
  sort: 'updated' | 'title'
  tag?: string
}

const WIKI_LINK_SOURCE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g

function stripWikiLinks(text: string): string {
  return text.replace(WIKI_LINK_SOURCE, (_, a, b) => b ?? a)
}

interface NotePeek {
  title: string
  status: NoteStatus
  excerpt: string
}

// Minimal metadata for the hover preview of a linked note
function readPeek(dir: string, slug: string): NotePeek | null {
  const filePath = `${dir}/${slug}.md`
  if (!existsSync(filePath)) return null
  const { data, content } = matter(readFileSync(filePath, 'utf8'))
  return {
    title: (data.title as string) ?? slug,
    status: NOTE_STATUSES.includes(data.status) ? data.status : 'draft',
    excerpt: (data.description as string) ?? firstParagraph(content),
  }
}

export const NOTE_STATUS_LABEL: Record<NoteStatus, string> = {
  draft: 'draft',
  wip: 'in progress',
  complete: 'complete',
}

function hText(value: string) {
  return { type: 'text', value }
}

function hEl(tagName: string, properties: Record<string, unknown>, children: unknown[]) {
  return { type: 'element', tagName, properties, children }
}

// Transforms [[note-slug]] and [[note-slug|display text]] into links with a hover preview
const wikiLinksPlugin: Plugin<[{ sourceSlug: string; dir: string }], Root> = ({
  sourceSlug,
  dir,
}) => {
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

        const peek = readPeek(dir, targetSlug)
        const children: unknown[] = [
          hEl('a', { href: `/garden/${targetSlug}` }, [hText(displayText)]),
        ]
        if (peek) {
          children.push(
            hEl('span', { className: ['peek'], role: 'tooltip' }, [
              hEl('b', {}, [hText(peek.title)]),
              hEl('span', { className: ['garden-status', `garden-status--${peek.status}`] }, [
                hText(`[${NOTE_STATUS_LABEL[peek.status]}]`),
              ]),
              hEl('span', {}, [hText(peek.excerpt)]),
            ])
          )
        }

        newNodes.push({
          type: 'wikiLink',
          data: {
            hName: 'span',
            hProperties: { className: peek ? ['wl'] : ['wl', 'wl--missing'] },
            hChildren: children,
          },
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

function toFigure(img: any) {
  const alt = img.properties?.alt as string | undefined
  const children: unknown[] = [
    hEl('a', { href: img.properties?.src, title: 'open full size' }, [img]),
  ]
  if (alt) children.push(hEl('figcaption', {}, [hText(alt)]))
  return hEl('figure', { className: ['fig'] }, children)
}

const isFiller = (c: any) => (c.type === 'text' && !c.value.trim()) || c.tagName === 'br'

// Lifts images out of paragraphs into linked figures with the alt as caption
function rehypeFigures() {
  return (tree: any) => {
    visit(tree, 'element', (node: any, index, parent: any) => {
      if (node.tagName !== 'p' || !parent) return
      if (!node.children.some((c: any) => c.tagName === 'img')) return

      const out: unknown[] = []
      let run: any[] = []
      const flush = () => {
        while (run.length && isFiller(run[0])) run.shift()
        while (run.length && isFiller(run[run.length - 1])) run.pop()
        if (run.length) out.push(hEl('p', {}, run))
        run = []
      }
      for (const child of node.children) {
        if (child.tagName === 'img') {
          flush()
          out.push(toFigure(child))
        } else {
          run.push(child)
        }
      }
      flush()

      parent.children.splice(index!, 1, ...out)
      return [SKIP, index! + out.length]
    })
  }
}

function makeProcessor(sourceSlug: string, dir: string) {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkAlerts)
    .use(wikiLinksPlugin, { sourceSlug, dir })
    .use(remarkRehype)
    .use(rehypeFigures)
    .use(rehypeHighlight)
    .use(rehypeStringify)
}

function toDateString(value: unknown): string | undefined {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return typeof value === 'string' ? value : undefined
}

// First paragraph as plain text, used when no description is set
function firstParagraph(content: string): string {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(content) as Root
  const para = tree.children.find((n) => n.type === 'paragraph')
  if (!para) return ''
  const text = stripWikiLinks(toString(para))
  return text.length > 200 ? `${text.slice(0, 200).trimEnd()}…` : text
}

function fileToSlug(filename: string): string {
  return path.basename(filename, '.md')
}

async function parseNote(filePath: string): Promise<Note> {
  const source = await Bun.file(filePath).text()
  const { data, content } = matter(source)
  const filename = path.basename(filePath)
  const slug = fileToSlug(filename)

  const result = await makeProcessor(slug, path.dirname(filePath)).process(content)
  const backlinks = getBacklinks(slug)
  const frontmatter = {
    ...data,
    created: toDateString(data.created),
    updated: toDateString(data.updated),
  } as NoteFrontmatter
  const status = NOTE_STATUSES.includes(frontmatter.status!) ? frontmatter.status! : 'draft'

  return {
    frontmatter,
    html: String(result),
    slug,
    filename,
    backlinks,
    status,
    tended: frontmatter.updated ?? frontmatter.created,
    excerpt: frontmatter.description ?? firstParagraph(content),
    readingMinutes: Math.max(1, Math.round(content.split(/\s+/).filter(Boolean).length / 200)),
  }
}

export function filterNotes(notes: Note[], query: GardenQuery): Note[] {
  return notes
    .filter((n) => query.status === 'all' || n.status === query.status)
    .filter((n) => !query.tag || n.frontmatter.tags?.includes(query.tag))
    .sort((a, b) =>
      query.sort === 'updated'
        ? (b.tended ?? '').localeCompare(a.tended ?? '')
        : (a.frontmatter.title ?? a.slug).localeCompare(b.frontmatter.title ?? b.slug)
    )
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
  context?: { before: string; link: string; after: string }
}

const CONTEXT_CHARS = 60

// Text surrounding the first [[target]] link in the source note
function linkContext(content: string, target: string): BacklinkEntry['context'] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(content) as Root
  let found: BacklinkEntry['context']
  visit(tree, 'paragraph', (para) => {
    if (found) return
    const text = toString(para)
    for (const match of text.matchAll(WIKI_LINK_SOURCE)) {
      if (match[1].trim() !== target) continue
      const start = match.index!
      const end = start + match[0].length
      const cutBefore = start > CONTEXT_CHARS
      const cutAfter = end + CONTEXT_CHARS < text.length
      let before = text.slice(Math.max(0, start - CONTEXT_CHARS), start)
      let after = text.slice(end, end + CONTEXT_CHARS)
      // Drop partial words at the cut edges
      if (cutBefore) before = before.replace(/^\S*\s/, '')
      if (cutAfter) after = after.replace(/\s\S*$/, '')
      found = {
        before: (cutBefore ? '…' : '') + stripWikiLinks(before).trimStart(),
        link: match[0],
        after: stripWikiLinks(after).trimEnd() + (cutAfter ? '…' : ''),
      }
      return
    }
  })
  return found
}

export async function resolveBacklinks(
  dir: string,
  target: string,
  slugs: string[]
): Promise<BacklinkEntry[]> {
  const entries: BacklinkEntry[] = []
  for (const slug of slugs) {
    const filePath = `${dir}/${slug}.md`
    const file = Bun.file(filePath)
    if (!(await file.exists())) continue
    const { data, content } = matter(await file.text())
    entries.push({
      slug,
      title: (data.title as string) ?? slug,
      context: linkContext(content, target),
    })
  }
  return entries
}
