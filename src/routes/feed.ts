import { Hono } from 'hono'
import { listPosts } from '../content/parser'

const BLOG_DIR = `${process.cwd()}/content/blog`
const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000'
const SITE_TITLE = 'kojin'
const SITE_AUTHOR = process.env.SITE_AUTHOR ?? 'kojin'

export const feedRoute = new Hono()

function toRFC3339(date: string | Date): string {
  if (date instanceof Date) return date.toISOString()
  return date.includes('T') ? date : `${date}T00:00:00Z`
}

feedRoute.get('/', async (c) => {
  const posts = (await listPosts(BLOG_DIR)).slice(0, 20)
  const firstPost = posts[0]
  const updated = firstPost
    ? toRFC3339(firstPost.frontmatter.updated ?? firstPost.frontmatter.date)
    : new Date().toISOString()

  const items = posts
    .map(
      (p) => `
    <entry>
      <id>${SITE_URL}/blog/${p.slug}</id>
      <title>${escape(p.frontmatter.title)}</title>
      <link href="${SITE_URL}/blog/${p.slug}" />
      <published>${toRFC3339(p.frontmatter.date)}</published>
      <updated>${toRFC3339(p.frontmatter.updated ?? p.frontmatter.date)}</updated>
      ${(p.frontmatter.tags ?? []).map((t) => `<category term="${escape(t)}" />`).join('')}
      <content type="html"><![CDATA[${p.html}]]></content>
    </entry>`
    )
    .join('')

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${SITE_URL}/</id>
  <title>${escape(SITE_TITLE)}</title>
  <link href="${SITE_URL}/" />
  <link rel="self" href="${SITE_URL}/feed.xml" />
  <updated>${updated}</updated>
  <author><name>${escape(SITE_AUTHOR)}</name></author>
  ${items}
</feed>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  })
})

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
