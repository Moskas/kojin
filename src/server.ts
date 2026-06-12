import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { blogRoutes } from './routes/blog'
import { gardenRoutes } from './routes/garden'
import { photosRoutes } from './routes/photos'
import { projectsRoutes } from './routes/projects'
import { usesRoute } from './routes/uses'
import { bookshelfRoute } from './routes/bookshelf'
import { searchRoutes } from './routes/search'
import { feedRoute } from './routes/feed'
import { photosFeedRoute } from './routes/photos-feed'
import { homeRoute } from './routes/home'
import { nowRoute } from './routes/now'
import { aboutRoute } from './routes/about'
import { sitemapRoute } from './routes/sitemap'
import { travelsRoutes } from './routes/travels'
import { buildIndexes } from './content/index'

const app = new Hono()

app.use('/static/*', serveStatic({ root: './src' }))

app.route('/', homeRoute)
app.route('/now', nowRoute)
app.route('/about', aboutRoute)
app.route('/blog', blogRoutes)
app.route('/garden', gardenRoutes)
app.route('/photos/feed.xml', photosFeedRoute)
app.route('/photos', photosRoutes)
app.route('/projects', projectsRoutes)
app.route('/uses', usesRoute)
app.route('/bookshelf', bookshelfRoute)
app.route('/search', searchRoutes)
app.route('/feed.xml', feedRoute)
app.route('/sitemap', sitemapRoute)
app.route('/travels', travelsRoutes)

const port = parseInt(process.env.PORT ?? '3000')

await buildIndexes()
console.log(`kojin running at http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
