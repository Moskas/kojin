import type { FC } from 'hono/jsx'
import { Layout } from '../layout'
import type { ParsedContent } from '../../content/parser'

type Props = {
  post: ParsedContent
  prev?: { slug: string; title: string }
  next?: { slug: string; title: string }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const BlogPost: FC<Props> = ({ post, prev, next }) => (
  <Layout title={post.frontmatter.title} description={post.frontmatter.description}>
    <article class="blog-post">
      <header class="post-header">
        <h1>{post.frontmatter.title}</h1>
        <time dateTime={post.frontmatter.date}>{formatDate(post.frontmatter.date)}</time>
        {post.frontmatter.tags && (
          <div class="tags">
            {post.frontmatter.tags.map((tag) => (
              <a key={tag} href={`/blog?tag=${tag}`} class="tag">
                {tag}
              </a>
            ))}
          </div>
        )}
      </header>
      <div class="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
      <nav class="post-nav">
        {prev && (
          <a href={`/blog/${prev.slug}`} class="post-nav-prev">
            ← {prev.title}
          </a>
        )}
        {next && (
          <a href={`/blog/${next.slug}`} class="post-nav-next">
            {next.title} →
          </a>
        )}
      </nav>
    </article>
  </Layout>
)
