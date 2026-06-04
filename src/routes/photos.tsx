import { Hono } from 'hono'
import { loadRoll, generateCachedImage } from '../content/photos'
import { PhotoRoll } from '../views/photos/roll'

export const photosRoutes = new Hono()

photosRoutes.get('/', async (c) => {
  const days = await loadRoll()
  return c.html(<PhotoRoll days={days} />)
})

photosRoutes.get('/img/:date/:filename', async (c) => {
  const dateSlug = c.req.param('date')
  const filename = c.req.param('filename')
  const cachePath = await generateCachedImage(dateSlug, filename)
  if (!cachePath) return c.notFound()

  return new Response(Bun.file(cachePath), {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
})
