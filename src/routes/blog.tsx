import { Hono } from 'hono'
import { listPosts, loadPost } from '../content/parser'
import { BlogList } from '../views/blog/list'
import { BlogPost } from '../views/blog/post'

const BLOG_DIR = `${process.cwd()}/content/blog`

export const blogRoutes = new Hono()

blogRoutes.get('/', async (c) => {
  const tag = c.req.query('tag')
  let posts = await listPosts(BLOG_DIR)

  if (tag) {
    posts = posts.filter((p) => p.frontmatter.tags?.includes(tag))
  }

  return c.html(<BlogList posts={posts} activeTag={tag} />)
})

blogRoutes.get('/:slug', async (c) => {
  const slug = c.req.param('slug')
  const allPosts = await listPosts(BLOG_DIR)
  const idx = allPosts.findIndex((p) => p.slug === slug)

  if (idx === -1) return c.notFound()

  const post = allPosts[idx]
  const next = idx > 0 ? allPosts[idx - 1] : undefined
  const prev = idx < allPosts.length - 1 ? allPosts[idx + 1] : undefined

  return c.html(
    <BlogPost
      post={post}
      prev={prev ? { slug: prev.slug, title: prev.frontmatter.title } : undefined}
      next={next ? { slug: next.slug, title: next.frontmatter.title } : undefined}
    />
  )
})
