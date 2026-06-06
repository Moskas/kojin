import { Hono } from 'hono'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { getLastfmData } from '../content/lastfm'
import { getAnilistData } from '../content/anilist'
import { NowPage } from '../views/now/index'

const NOW_FILE = `${process.cwd()}/content/now.md`

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify)

async function loadNow(): Promise<{ html: string; updated: string }> {
  const file = Bun.file(NOW_FILE)
  if (!(await file.exists())) return { html: '', updated: '' }
  const { data, content } = matter(await file.text())
  const html = String(await processor.process(content))
  const raw = data.updated
  const updated = raw instanceof Date
    ? raw.toISOString().slice(0, 10)
    : String(raw ?? '')
  return { html, updated }
}

export const nowRoute = new Hono()

nowRoute.get('/', async (c) => {
  const [{ html: nowHtml, updated }, lastfm, anilist] = await Promise.all([
    loadNow(),
    getLastfmData(),
    getAnilistData(),
  ])
  return c.html(<NowPage nowHtml={nowHtml} updated={updated} lastfm={lastfm} anilist={anilist} />)
})
