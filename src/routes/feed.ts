import { Hono } from 'hono'
import { listPosts } from '../content/parser'

const BLOG_DIR = `${process.cwd()}/content/blog`
const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000'
const SITE_TITLE = 'kojin'
const SITE_AUTHOR = process.env.SITE_AUTHOR ?? 'kojin'

export const feedRoute = new Hono()

feedRoute.get('/', async (c) => {
  const posts = (await listPosts(BLOG_DIR)).slice(0, 20)
  const updated = posts[0]?.frontmatter.date ?? new Date().toISOString()

  const items = posts
    .map(
      (p) => `
    <entry>
      <id>${SITE_URL}/blog/${p.slug}</id>
      <title>${escape(p.frontmatter.title)}</title>
      <link href="${SITE_URL}/blog/${p.slug}" />
      <updated>${p.frontmatter.date}</updated>
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
