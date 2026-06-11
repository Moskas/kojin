import { Hono } from 'hono'
import { loadRoll } from '../content/photos'

const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000'
const SITE_AUTHOR = process.env.SITE_AUTHOR ?? 'kojin'

export const photosFeedRoute = new Hono()

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
}

photosFeedRoute.get('/', async (c) => {
  const days = (await loadRoll()).slice(0, 20)
  const updated = days[0] ? `${days[0].date}T00:00:00Z` : new Date().toISOString()

  const items = days
    .map((day) => {
      const imgs = day.photos
        .map((p) => `<img src="${SITE_URL}${p.medium}" alt="${escape(p.base)}" style="max-width:100%;display:block;margin-bottom:0.5rem" />`)
        .join('')
      const content = imgs + (day.noteHtml ?? '')
      return `
    <entry>
      <id>${SITE_URL}/photos#${day.date}</id>
      <title>${escape(formatDate(day.date))}</title>
      <link href="${SITE_URL}/photos#${day.date}" />
      <updated>${day.date}T00:00:00Z</updated>
      <content type="html"><![CDATA[${content}]]></content>
    </entry>`
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${SITE_URL}/photos</id>
  <title>Photos — Moskas' Space</title>
  <link href="${SITE_URL}/photos" />
  <link rel="self" href="${SITE_URL}/photos/feed.xml" />
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
