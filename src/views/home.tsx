import type { FC } from 'hono/jsx'
import { Layout } from './layout'
import type { ParsedContent } from '../content/parser'
import type { Photo } from '../content/photos'

type Props = {
  recentPosts: ParsedContent[]
  aboutHtml: string
  recentPhotos: Photo[]
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const Home: FC<Props> = ({ recentPosts, aboutHtml, recentPhotos }) => (
  <Layout title="kojin">
    <section class="about">
      <div class="prose" dangerouslySetInnerHTML={{ __html: aboutHtml }} />
    </section>

    <div class="home-sections">
      <section class="home-section">
        <header class="section-header">
          <h2>recent posts</h2>
          <a href="/blog" class="section-more">all posts →</a>
        </header>
        {recentPosts.length === 0 ? (
          <p class="empty">no posts yet</p>
        ) : (
          <ul class="post-list post-list--compact">
            {recentPosts.map((post) => (
              <li key={post.slug} class="post-item">
                <time dateTime={post.frontmatter.date}>{formatDate(post.frontmatter.date)}</time>
                <a href={`/blog/${post.slug}`}>{post.frontmatter.title}</a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section class="home-section">
        <header class="section-header">
          <h2>recent photos</h2>
          <a href="/photos" class="section-more">all photos →</a>
        </header>
        {recentPhotos.length === 0 ? (
          <p class="empty">no photos yet</p>
        ) : (
          <div class="home-photo-strip">
            {recentPhotos.map((photo) => (
              <a key={photo.base} href="/photos" class="home-photo">
                <img src={photo.thumb} alt={photo.base} loading="lazy" decoding="async" />
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  </Layout>
)
