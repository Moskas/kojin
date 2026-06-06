import { Hono } from 'hono'
import { loadUses } from '../content/uses'
import { UsesPage } from '../views/uses/index'

export const usesRoute = new Hono()

usesRoute.get('/', async (c) => {
  const uses = await loadUses()
  return c.html(<UsesPage uses={uses} />)
})
