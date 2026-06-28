import { Hono } from 'hono'
import { loadWatchlist } from '../content/watchlist'
import type { WatchStatus, WatchQuery } from '../content/watchlist'
import { WatchlistPage } from '../views/watchlist/index'

export const watchlistRoute = new Hono()

const VALID_FILTERS = new Set<string>(['all', 'watching', 'finished', 'plan', 'dropped'])
const VALID_SORTS = new Set<string>(['rating', 'title', 'year'])

watchlistRoute.get('/', async (c) => {
  const rawFilter = c.req.query('filter') ?? 'all'
  const rawSort = c.req.query('sort') ?? 'rating'
  const q = c.req.query('q') ?? ''

  const query: WatchQuery = {
    filter: VALID_FILTERS.has(rawFilter) ? (rawFilter as WatchStatus | 'all') : 'all',
    sort: VALID_SORTS.has(rawSort) ? (rawSort as 'rating' | 'title' | 'year') : 'rating',
    q,
  }

  const sections = await loadWatchlist(query)
  return c.html(<WatchlistPage sections={sections} query={query} />)
})
