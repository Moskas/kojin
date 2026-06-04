import type { FC } from 'hono/jsx'
import { Layout } from '../layout'
import type { ParsedContent } from '../../content/parser'

type Props = {
  posts: ParsedContent[]
  activeTag?: string
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const BlogList: FC<Props> = ({ posts, activeTag }) => (
  <Layout title="Blog">
    <section class="page-header">
      <h1>blog</h1>
    </section>

    {posts.length === 0 ? (
      <p class="empty">no posts yet</p>
    ) : (
      <ul class="post-list">
        {posts.map((post) => (
          <li key={post.slug} class="post-item">
            <time dateTime={post.frontmatter.date}>{formatDate(post.frontmatter.date)}</time>
            <a href={`/blog/${post.slug}`}>{post.frontmatter.title}</a>
            {post.frontmatter.tags && (
              <div class="tags">
                {post.frontmatter.tags.map((tag) => (
                  <a key={tag} href={`/blog?tag=${tag}`} class={`tag${activeTag === tag ? ' active' : ''}`}>
                    {tag}
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
