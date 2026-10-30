import type { FC } from 'hono/jsx'
import { Layout } from '../layout'
import type { ParsedContent, TocItem } from '../../content/parser'
import { Sep, joinNodes } from '../text-sep'

const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000'

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
  <ul>
    {items.map((item) => (
      <li key={item.id}>
        <a href={`#${item.id}`} data-depth={item.depth}>
          {item.text}
        </a>
      </li>
    ))}
  </ul>
)

export const BlogPost: FC<Props> = ({ post, prev, next }) => (
  <Layout
    title={post.frontmatter.title}
    description={post.frontmatter.description}
    mainClass="post-with-toc"
    ogType="article"
    canonicalUrl={`${SITE_URL}/blog/${post.slug}`}
  >
    <article class="blog-post">
      <details class="toc-mobile">
        <summary>contents</summary>
      </details>
      <nav class="toc-sidebar" aria-label="table of contents">
        <h3>Table of Contents</h3>
        <TocLinks items={post.headings} />
      </nav>
      <header class="post-header">
        <h1>{post.frontmatter.title}</h1>
        <time dateTime={post.frontmatter.date}>{formatDate(post.frontmatter.date)}</time>
        {post.frontmatter.tags && (
          <div class="tags">
            <Sep text="tags: " />
            {joinNodes(
              post.frontmatter.tags.map((tag) => (
                <a key={tag} href={`/blog?tag=${tag}`} class="tag">
                  {tag}
                </a>
              ))
            )}
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
        {prev && next && <Sep text=" | " />}
        {next && (
          <a href={`/blog/${next.slug}`} class="post-nav-next">
            {next.title} →
          </a>
        )}
      </nav>
    </article>
    <script src="/static/js/toc.js" defer></script>
  </Layout>
)
