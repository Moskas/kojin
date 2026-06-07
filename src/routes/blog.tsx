import { Hono } from 'hono'
import { listPosts, loadPost } from '../content/parser'
import { BlogList } from '../views/blog/list'
import { BlogPost } from '../views/blog/post'

const BLOG_DIR = `${process.cwd()}/content/blog`

export const blogRoutes = new Hono()

blogRoutes.get('/', async (c) => {
  const tag = c.req.query('tag')
  const year = c.req.query('year')
  const allPosts = await listPosts(BLOG_DIR)

  const getYear = (date: unknown): string => {
    if (!date) return ''
    if (date instanceof Date) return date.getFullYear().toString()
    return String(date).trim().slice(0, 4)
  }

  const allTags = [...new Set(allPosts.flatMap((p) => p.frontmatter.tags ?? []))].sort()
  const allYears = [...new Set(allPosts.map((p) => getYear(p.frontmatter.date)))]
    .filter(Boolean)
    .sort()
    .reverse()

  const tagCounts = Object.fromEntries(
    allTags.map((t) => [t, allPosts.filter((p) => p.frontmatter.tags?.includes(t)).length]),
  )
  const yearCounts = Object.fromEntries(
    allYears.map((y) => [y, allPosts.filter((p) => getYear(p.frontmatter.date) === y).length]),
  )

  let posts = allPosts
  if (tag) posts = posts.filter((p) => p.frontmatter.tags?.includes(tag))
  if (year) posts = posts.filter((p) => getYear(p.frontmatter.date) === year)

  return c.html(
    <BlogList
      posts={posts}
      activeTag={tag}
      activeYear={year}
      allTags={allTags}
      allYears={allYears}
      tagCounts={tagCounts}
      yearCounts={yearCounts}
    />,
  )
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
