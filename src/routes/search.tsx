import { Hono } from 'hono'
import { searchContent } from '../db/index'
import { SearchPage } from '../views/search/index'

export const searchRoutes = new Hono()

searchRoutes.get('/', async (c) => {
  const q = c.req.query('q')?.trim() ?? ''
  const results = q.length >= 2 ? (searchContent(q) as { slug: string; title: string; section: string }[]) : []
  return c.html(<SearchPage query={q} results={results} />)
})
