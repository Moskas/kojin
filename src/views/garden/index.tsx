import type { FC } from 'hono/jsx'
import { Layout } from '../layout'
import type { Note } from '../../content/garden'

const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000'

type Props = {
  notes: Note[]
}

export const GardenIndex: FC<Props> = ({ notes }) => (
  <Layout
    title="Garden"
    description="Notes in various states of development. Lightly tended, frequently incomplete."
    ogType="website"
    canonicalUrl={`${SITE_URL}/garden`}
  >
    <section class="page-header">
      <h1>garden</h1>
      <p class="page-description">
        Notes in various states of development. Lightly tended, frequently incomplete.
      </p>
    </section>

    {notes.length === 0 ? (
      <p class="empty">no notes yet</p>
    ) : (
      <ul class="note-list">
        {notes.map((note) => (
          <li key={note.slug} class="note-item">
            <a href={`/garden/${note.slug}`}>{note.frontmatter.title ?? note.slug}</a>
            {note.frontmatter.tags && (
              <div class="tags">
                {note.frontmatter.tags.map((tag) => (
                  <span key={tag} class="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    )}
  </Layout>
)
