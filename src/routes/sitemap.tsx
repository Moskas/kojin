import { Hono } from 'hono'
import { listPosts } from '../content/parser'
import { listNotes } from '../content/garden'
import { SitemapPage } from '../views/sitemap/index'
import type { SitemapSection } from '../views/sitemap/index'

const BLOG_DIR = `${process.cwd()}/content/blog`
const GARDEN_DIR = `${process.cwd()}/content/garden`

export const sitemapRoute = new Hono()

sitemapRoute.get('/', async (c) => {
  const [posts, notes] = await Promise.all([
    listPosts(BLOG_DIR),
    listNotes(GARDEN_DIR),
  ])

  const sections: SitemapSection[] = [
    {
      id: 'pages',
      title: 'pages',
      links: [
        { url: '/', label: 'home' },
        { url: '/about', label: 'about' },
        { url: '/now', label: 'now' },
        { url: '/uses', label: 'uses' },
        { url: '/bookshelf', label: 'bookshelf' },
        { url: '/search', label: 'search' },
        { url: '/feed.xml', label: 'atom feed' },
      ],
    },
    {
      id: 'blog',
      title: 'blog',
      links: [
        { url: '/blog', label: 'blog index' },
        ...posts.map((p) => ({
          url: `/blog/${p.slug}`,
          label: p.frontmatter.title ?? p.slug,
        })),
      ],
    },
    {
      id: 'garden',
      title: 'garden',
      links: [
        { url: '/garden', label: 'garden index' },
        ...notes.map((n) => ({
          url: `/garden/${n.slug}`,
          label: n.frontmatter.title ?? n.slug,
        })),
      ],
    },
    {
      id: 'photos',
      title: 'photos',
      links: [
        { url: '/photos', label: 'photos' },
        { url: '/photos/feed.xml', label: 'photos atom feed' },
      ],
    },
    {
      id: 'projects',
      title: 'projects',
      links: [{ url: '/projects', label: 'projects' }],
    },
  ]

  return c.html(<SitemapPage sections={sections} />)
})
