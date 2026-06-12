import { Hono } from 'hono'
import { loadTravels, loadEntry, generateCachedImage } from '../content/travels'
import { TravelsIndex } from '../views/travels/index'
import { TravelDetail } from '../views/travels/detail'

export const travelsRoutes = new Hono()

travelsRoutes.get('/', async (c) => {
  const countries = await loadTravels()
  return c.html(<TravelsIndex countries={countries} />)
})

travelsRoutes.get('/img/:country/:city/:date/:filename', async (c) => {
  const country = c.req.param('country')
  const city = c.req.param('city')
  const date = c.req.param('date')
  const filename = c.req.param('filename')
  const cachePath = await generateCachedImage(country, city, date, filename)
  if (!cachePath) return c.notFound()

  return new Response(Bun.file(cachePath), {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
})

travelsRoutes.get('/:country/:city/:date', async (c) => {
  const country = c.req.param('country')
  const city = c.req.param('city')
  const date = c.req.param('date')
  const entry = await loadEntry(country, city, date)
  if (!entry) return c.notFound()
  return c.html(<TravelDetail entry={entry} />)
})
