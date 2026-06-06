import { Hono } from 'hono'
import { loadMarkdownFile } from '../content/parser'
import { AboutPage } from '../views/about/index'

const ABOUT_FILE = `${process.cwd()}/content/about.md`

export const aboutRoute = new Hono()

aboutRoute.get('/', async (c) => {
  const html = await loadMarkdownFile(ABOUT_FILE)
  return c.html(<AboutPage html={html} />)
})
