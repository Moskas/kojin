import { Hono } from 'hono'
import { listPosts, loadMarkdownFile } from '../content/parser'
import { getRecentPhotos } from '../content/photos'
import { Home } from '../views/home'

const BLOG_DIR = `${process.cwd()}/content/blog`
const ABOUT_FILE = `${process.cwd()}/content/landing.md`

export const homeRoute = new Hono()

homeRoute.get('/', async (c) => {
  const [posts, aboutHtml, recentPhotos] = await Promise.all([
    listPosts(BLOG_DIR),
    loadMarkdownFile(ABOUT_FILE),
    getRecentPhotos(6),
  ])

  return c.html(<Home recentPosts={posts.slice(0, 3)} aboutHtml={aboutHtml} recentPhotos={recentPhotos} />)
})
