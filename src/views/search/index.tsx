import type { FC } from 'hono/jsx'
import { Layout } from '../layout'

type Result = { slug: string; title: string; section: string }

type Props = {
  query: string
  results: Result[]
}

const SECTION_HREF: Record<string, (slug: string) => string> = {
  blog: (slug) => `/blog/${slug}`,
  garden: (slug) => `/garden/${slug}`,
}

export const SearchPage: FC<Props> = ({ query, results }) => (
  <Layout title={query ? `search: ${query}` : 'search'}>
    <section class="page-header">
      <h1>search</h1>
    </section>

    <form action="/search" class="search-form">
      <input
        type="search"
        name="q"
        value={query}
        placeholder="search posts and notes..."
        autofocus
        class="search-input"
      />
      <button type="submit" class="search-submit">search</button>
    </form>

    {query.length >= 2 && (
      <div class="search-results">
        {results.length === 0 ? (
          <p class="empty">no results for &ldquo;{query}&rdquo;</p>
        ) : (
          <ul class="result-list">
            {results.map((r) => (
              <li key={`${r.section}/${r.slug}`} class="result-item">
                <span class="result-section">{r.section}</span>
                <a href={(SECTION_HREF[r.section] ?? ((s) => `/${r.section}/${s}`))(r.slug)}>
                  {r.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    )}
  </Layout>
)
