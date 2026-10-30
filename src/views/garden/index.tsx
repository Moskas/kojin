import type { FC } from 'hono/jsx'
import { Layout } from '../layout'
import { NOTE_STATUS_LABEL as STATUS_LABEL } from '../../content/garden'
import type { Note, NoteStatus, GardenQuery } from '../../content/garden'

const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000'

type Props = {
  notes: Note[]
  allTags: string[]
  query: GardenQuery
}

const STATUS_DESC: Record<NoteStatus, string> = {
  draft: 'rough notes',
  wip: 'taking shape',
  complete: 'done, occasionally updated',
}

const STATUSES: NoteStatus[] = ['draft', 'wip', 'complete']

function buildUrl(base: GardenQuery, overrides: Partial<GardenQuery>): string {
  const p = { ...base, ...overrides }
  const params = new URLSearchParams()
  if (p.status !== 'all') params.set('status', p.status)
  if (p.sort !== 'updated') params.set('sort', p.sort)
  if (p.tag) params.set('tag', p.tag)
  const qs = params.toString()
  return `/garden${qs ? '?' + qs : ''}`
}

const fmt = (d: string) => d.replace(/-/g, '.')

const NoteRow: FC<{ note: Note; query: GardenQuery }> = ({ note, query }) => (
  <li class="garden-note-item">
    <h3>
      <a href={`/garden/${note.slug}`}>{note.frontmatter.title ?? note.slug}</a>
    </h3>
    <div class="garden-note-meta">
      <span>
        status{' '}
        <span class={`garden-status garden-status--${note.status}`}>
          [{STATUS_LABEL[note.status]}]
        </span>
      </span>
      {note.tended && (
        <span>
          updated <time datetime={note.tended}>{fmt(note.tended)}</time>
        </span>
      )}
    </div>
    {note.excerpt && <p class="garden-excerpt">{note.excerpt}</p>}
    <div class="garden-note-foot">
      {note.frontmatter.tags && (
        <span class="tags">
          {note.frontmatter.tags.map((t) => (
            <a
              key={t}
              href={buildUrl(query, { tag: query.tag === t ? undefined : t })}
              class={`tag${query.tag === t ? ' active' : ''}`}
            >
              {t}
            </a>
          ))}
        </span>
      )}
      <span class="garden-links">
        ↩ {note.backlinks.length} {note.backlinks.length === 1 ? 'backlink' : 'backlinks'}
      </span>
    </div>
  </li>
)

export const GardenIndex: FC<Props> = ({ notes, allTags, query }) => (
  <Layout
    title="Garden"
    description="Notes in various states of development, from rough drafts to finished write-ups."
    ogType="website"
    canonicalUrl={`${SITE_URL}/garden`}
  >
    <section class="page-header">
      <h1>garden</h1>
      <p class="page-description">
        Notes in various states of development, from rough drafts to finished write-ups.
      </p>
    </section>

    <div class="garden-legend">
      {STATUSES.map((s) => (
        <span key={s}>
          <span class={`garden-status garden-status--${s}`}>[{STATUS_LABEL[s]}]</span>
          {STATUS_DESC[s]}
        </span>
      ))}
    </div>

    <div class="bookshelf-toolbar">
      <div class="bookshelf-ctl">
        <span class="bookshelf-lab">status</span>
        {(['all', ...STATUSES] as const).map((s) => (
          <a
            key={s}
            href={buildUrl(query, { status: s })}
            class={`bookshelf-chip${query.status === s ? ' bookshelf-chip--active' : ''}`}
          >
            {s === 'all' ? 'all' : STATUS_LABEL[s]}
          </a>
        ))}
      </div>
      <div class="bookshelf-ctl">
        <span class="bookshelf-lab">sort</span>
        {(['updated', 'title'] as const).map((s) => (
          <a
            key={s}
            href={buildUrl(query, { sort: s })}
            class={`bookshelf-chip${query.sort === s ? ' bookshelf-chip--active' : ''}`}
          >
            {s}
          </a>
        ))}
      </div>
      <div class="bookshelf-ctl">
        <span class="bookshelf-lab">tag</span>
        <span class="tags">
          {allTags.map((t) => (
            <a
              key={t}
              href={buildUrl(query, { tag: query.tag === t ? undefined : t })}
              class={`tag${query.tag === t ? ' active' : ''}`}
            >
              {t}
            </a>
          ))}
        </span>
      </div>
    </div>

    <div class="garden-count">
      <span>
        {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        {query.tag && <> in #{query.tag}</>}
      </span>
      {query.tag && <a href={buildUrl(query, { tag: undefined })}>clear tag</a>}
    </div>

    {notes.length === 0 ? (
      <p class="bookshelf-empty">no notes match</p>
    ) : (
      <ul class="garden-notes">
        {notes.map((note) => (
          <NoteRow key={note.slug} note={note} query={query} />
        ))}
      </ul>
    )}
  </Layout>
)
