import { Hono } from 'hono'
import { loadBookshelf } from '../content/bookshelf'
import type { BookStatus, BookshelfQuery } from '../content/bookshelf'
import { BookshelfPage } from '../views/bookshelf/index'

export const bookshelfRoute = new Hono()

const VALID_FILTERS = new Set<string>(['all', 'reading', 'finished', 'hold'])
const VALID_SORTS = new Set<string>(['rating', 'title'])

bookshelfRoute.get('/', async (c) => {
  const rawFilter = c.req.query('filter') ?? 'all'
  const rawSort = c.req.query('sort') ?? 'rating'
  const q = c.req.query('q') ?? ''

  const query: BookshelfQuery = {
    filter: VALID_FILTERS.has(rawFilter) ? (rawFilter as BookStatus | 'all') : 'all',
    sort: VALID_SORTS.has(rawSort) ? (rawSort as 'rating' | 'title') : 'rating',
    q,
  }

  const sections = await loadBookshelf(query)
  return c.html(<BookshelfPage sections={sections} query={query} />)
})
