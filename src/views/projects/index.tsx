import type { FC } from 'hono/jsx'
import { Layout } from '../layout'
import type { Project } from '../../routes/projects'

type Props = { projects: Project[] }

const STATUS_LABEL: Record<string, string> = {
  active: 'active',
  wip: 'in progress',
  archived: 'archived',
}

export const ProjectsIndex: FC<Props> = ({ projects }) => (
  <Layout title="Projects">
    <section class="page-header">
      <h1>projects</h1>
    </section>

    {projects.length === 0 ? (
      <p class="empty">no projects yet</p>
    ) : (
      <ul class="project-list">
        {projects.map((p) => (
          <li key={p.slug} class="project-card">
            <div class="project-header">
              <h2>
                {p.meta.url ? (
                  <a href={p.meta.url} target="_blank" rel="noopener noreferrer">
                    {p.meta.title}
                  </a>
                ) : (
                  p.meta.title
                )}
              </h2>
              <span class={`status status--${p.meta.status}`}>{STATUS_LABEL[p.meta.status] ?? p.meta.status}</span>
            </div>
            <p class="project-description">{p.meta.description}</p>
            <div class="project-footer">
              <div class="tags">
                {(p.meta.tech ?? []).map((t) => (
                  <span key={t} class="tag">{t}</span>
                ))}
              </div>
              <div class="project-links">
                {p.meta.source && (
                  <a href={p.meta.source} target="_blank" rel="noopener noreferrer" class="project-link">
                    source
                  </a>
                )}
                <span class="project-year">{p.meta.year}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    )}
  </Layout>
)
