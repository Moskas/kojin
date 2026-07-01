import type { FC } from 'hono/jsx'
import { Layout } from '../layout'
import type { ParsedContent } from '../../content/parser'

const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000'

type Props = {
  posts: ParsedContent[]
  activeTag?: string
  activeYear?: string
  allTags: string[]
  allYears: string[]
  tagCounts: Record<string, number>
  yearCounts: Record<string, number>
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const BlogList: FC<Props> = ({
  posts,
  activeTag,
  activeYear,
  allTags,
  allYears,
  tagCounts,
  yearCounts,
}) => (
  <Layout
    title="Blog"
    description="Writing on software, tools, and things I find interesting."
    ogType="website"
    canonicalUrl={`${SITE_URL}/blog`}
  >
    <section class="page-header">
      <h1>blog</h1>
    </section>

    <div class="blog-filters">
      <div class="blog-filters-tags">
        <span class="blog-filters-label">Filter posts by tag:</span>
        {allTags.map((tag) => (
          <a
            key={tag}
            href={`/blog?tag=${tag}`}
            class={`tag${activeTag === tag ? ' active' : ''}`}
          >
            {tag} ({tagCounts[tag]})
          </a>
        ))}
      </div>
      <div class="blog-filters-years">
        <span class="blog-filters-label">Filter posts by year:</span>
        {allYears.map((y) => (
          <a
            key={y}
            href={`/blog?year=${y}`}
            class={`tag${activeYear === y ? ' active' : ''}`}
          >
            {y} ({yearCounts[y]})
          </a>
        ))}
      </div>
    </div>

    {(activeTag || activeYear) && (
      <p class="tag-filter-info">
        {activeTag && (
          <>
            tagged <span class="tag active">{activeTag}</span>
          </>
        )}
        {activeTag && activeYear && ' · '}
        {activeYear && <span>{activeYear}</span>}
        {' '}[{posts.length}] <a href="/blog">clear</a>
      </p>
    )}

    {posts.length === 0 ? (
      <p class="empty">no posts yet</p>
    ) : (
      <ul class="post-list post-list--separated">
        {posts.map((post) => (
          <li key={post.slug} class="post-item">
            <time dateTime={post.frontmatter.date}>{formatDate(post.frontmatter.date)}</time>
            <a href={`/blog/${post.slug}`}>{post.frontmatter.title}</a>
            {post.frontmatter.description && (
              <p class="post-description">{post.frontmatter.description}</p>
            )}
            {post.frontmatter.tags && (
              <div class="tags">
                {post.frontmatter.tags.map((tag) => (
                  <a
                    key={tag}
                    href={`/blog?tag=${tag}`}
                    class={`tag${activeTag === tag ? ' active' : ''}`}
                  >
                    #{tag}
                  </a>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    )}
  </Layout>
)
