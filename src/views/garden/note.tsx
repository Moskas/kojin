import type { FC } from 'hono/jsx'
import { Layout } from '../layout'
import type { Note, BacklinkEntry } from '../../content/garden'

type Props = {
  note: Note
  backlinks: BacklinkEntry[]
}

export const GardenNote: FC<Props> = ({ note, backlinks }) => (
  <Layout title={note.frontmatter.title ?? note.slug}>
    <article class="garden-note">
      <header class="note-header">
        <h1>{note.frontmatter.title ?? note.slug}</h1>
        {note.frontmatter.tags && (
          <div class="tags">
            {note.frontmatter.tags.map((tag) => (
              <span key={tag} class="tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div class="prose" dangerouslySetInnerHTML={{ __html: note.html }} />

      {backlinks.length > 0 && (
        <aside class="backlinks">
          <h3>linked from</h3>
          <ul>
            {backlinks.map((link) => (
              <li key={link.slug}>
                <a href={`/garden/${link.slug}`}>{link.title}</a>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </article>
  </Layout>
)
