import type { FC } from 'hono/jsx'
import { Layout } from '../layout'
import type { ParsedContent, TocItem } from '../../content/parser'

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

const TocLinks: FC<{ items: TocItem[] }> = ({ items }) => (
  <>
    {items.map((item) => (
      <a key={item.id} href={`#${item.id}`} data-depth={item.depth}>
        {item.text}
      </a>
    ))}
  </>
)

export const BlogPost: FC<Props> = ({ post, prev, next }) => (
  <Layout
    title={post.frontmatter.title}
    description={post.frontmatter.description}
    mainClass="post-with-toc"
  >
    <article class="blog-post">
      <details class="toc-mobile">
        <summary>contents</summary>
        <nav>
          <TocLinks items={post.headings} />
        </nav>
      </details>
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
    <nav class="toc-sidebar">
      <TocLinks items={post.headings} />
    </nav>
    <script src="/static/js/toc.js" defer></script>
  </Layout>
)
