import type { FC } from 'hono/jsx'
import { Layout } from '../layout'
import { Sep } from '../text-sep'

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
      <label for="search-q" class="visually-hidden">
        search posts and notes
      </label>
      <Sep text=": " />
      <input
        type="search"
        id="search-q"
        name="q"
        value={query}
        placeholder="search posts and notes..."
        autofocus
        class="search-input"
      />
      <Sep text=" " />
      <button type="submit" class="search-submit">
        search
      </button>
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
                <Sep text=": " />
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
