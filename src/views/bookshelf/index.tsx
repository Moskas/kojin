import type { FC } from 'hono/jsx'
import { Layout } from '../layout'
import type { BookshelfEntry, BookshelfSection, BookshelfQuery, BookStatus } from '../../content/bookshelf'

type Props = {
  sections: BookshelfSection[]
  query: BookshelfQuery
}

const STATUS_LABEL: Record<BookStatus | 'all', string> = {
  all: 'all',
  reading: 'reading',
  finished: 'finished',
  hold: 'on hold',
}

const FILTERS: Array<BookStatus | 'all'> = ['all', 'reading', 'finished', 'hold']
function buildUrl(base: BookshelfQuery, overrides: Partial<BookshelfQuery>): string {
  const p = { ...base, ...overrides }
  const params = new URLSearchParams()
  if (p.filter !== 'all') params.set('filter', p.filter)
  if (p.q) params.set('q', p.q)
  const qs = params.toString()
  return `/bookshelf${qs ? '?' + qs : ''}`
}

const RatingBar: FC<{ value: number }> = ({ value }) => {
  const filled = Math.round(value)
  const empty = 10 - filled
  return (
    <span class="bookshelf-rating" aria-label={`rating ${value} out of 10`}>
      <span class="bookshelf-rating-bracket">[</span>
      <span class="bookshelf-rating-fill">{'█'.repeat(filled)}</span>
      <span class="bookshelf-rating-empty">{'░'.repeat(empty)}</span>
      <span class="bookshelf-rating-bracket">]</span>
      <span class="bookshelf-rating-num">{value}/10</span>
    </span>
  )
}

const EntryRow: FC<{ entry: BookshelfEntry }> = ({ entry }) => (
  <div class="bookshelf-row">
    <div class="bookshelf-cover-col">
      <div class="bookshelf-cover">
        {entry.cover ? (
          <img src={entry.cover} alt={`${entry.title} cover`} loading="lazy" />
        ) : (
          <div class="bookshelf-cover-ph">{entry.title}</div>
        )}
      </div>
      <div class="bookshelf-stats">
        <span class="bookshelf-stat">
          <span class="bookshelf-stat-key">status</span>
          <span class={`bookshelf-status bookshelf-status--${entry.status}`}>
            {STATUS_LABEL[entry.status]}
          </span>
        </span>
        <span class="bookshelf-stat">
          <span class="bookshelf-stat-key">rating</span>
          <RatingBar value={entry.rating} />
        </span>
      </div>
    </div>
    <div class="bookshelf-entry">
      <div class="bookshelf-titleline">
        <h3 class="bookshelf-entry-title">
          {entry.link ? (
            <a href={entry.link} target="_blank" rel="noopener noreferrer">{entry.title}</a>
          ) : (
            entry.title
          )}
        </h3>
        <span class="bookshelf-author">{entry.author}</span>
      </div>
      <div
        class="bookshelf-writeup"
        dangerouslySetInnerHTML={{ __html: entry.writeupHtml }}
      />
    </div>
  </div>
)

const SectionBlock: FC<{ section: BookshelfSection }> = ({ section }) => (
  <section class="bookshelf-section">
    <div class="bookshelf-section-head">
      <span class="hash">#</span>
      <h2>{section.title}</h2>
      <span class="bookshelf-count">
        {section.entries.length} {section.entries.length === 1 ? 'entry' : 'entries'}
      </span>
    </div>
    {section.entries.length === 0 ? (
      <p class="bookshelf-empty">nothing here for this filter</p>
    ) : (
      section.entries.map((entry) => <EntryRow key={entry.id} entry={entry} />)
    )}
  </section>
)

export const BookshelfPage: FC<Props> = ({ sections, query }) => {
  const total = sections.reduce((n, s) => n + s.entries.length, 0)

  return (
    <Layout title="Bookshelf">
      <section class="page-header">
        <h1>bookshelf</h1>
        <p class="page-description">
          books and manga I've read or am reading. also on{' '}
          <a href="https://www.goodreads.com/user/show/179471334-moskas" target="_blank" rel="noopener noreferrer">goodreads</a>
          {' '}and{' '}
          <a href="https://anilist.co/user/Moskas" target="_blank" rel="noopener noreferrer">anilist</a>.
        </p>
      </section>

      <div class="bookshelf-toolbar">
        <div class="bookshelf-ctl">
          <span class="bookshelf-lab">filter</span>
          {FILTERS.map((f) => (
            <a
              key={f}
              href={buildUrl(query, { filter: f })}
              class={`bookshelf-chip${query.filter === f ? ' bookshelf-chip--active' : ''}`}
            >
              {STATUS_LABEL[f]}
            </a>
          ))}
        </div>
        <form action="/bookshelf" method="get" class="bookshelf-search">
          {query.filter !== 'all' && <input type="hidden" name="filter" value={query.filter} />}
          <input
            type="search"
            name="q"
            placeholder="search"
            value={query.q}
            aria-label="search bookshelf"
          />
        </form>
      </div>

      {total === 0 ? (
        <p class="bookshelf-empty">
          {query.q ? `no entries match "${query.q.trim()}"` : 'nothing here for this filter'}
        </p>
      ) : (
        sections.map((section) => <SectionBlock key={section.id} section={section} />)
      )}
    </Layout>
  )
}
