import { Hono } from 'hono'
import { loadWatchlist } from '../content/watchlist'
import type { WatchStatus, WatchQuery } from '../content/watchlist'
import { WatchlistPage } from '../views/watchlist/index'

export const watchlistRoute = new Hono()

const VALID_FILTERS = new Set<string>(['all', 'watching', 'finished', 'plan', 'dropped'])

watchlistRoute.get('/', async (c) => {
  const rawFilter = c.req.query('filter') ?? 'all'

  const query: WatchQuery = {
    filter: VALID_FILTERS.has(rawFilter) ? (rawFilter as WatchStatus | 'all') : 'all',
  }

  const sections = await loadWatchlist(query)
  return c.html(<WatchlistPage sections={sections} query={query} />)
})
