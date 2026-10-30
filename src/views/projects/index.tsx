import type { FC } from 'hono/jsx'
import { Layout } from '../layout'
import type { Project } from '../../routes/projects'
import { Sep, joinNodes } from '../text-sep'

const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000'

type Props = { projects: Project[] }

const STATUS_LABEL: Record<string, string> = {
  active: 'active',
  wip: 'in progress',
  archived: 'archived',
}

export const ProjectsIndex: FC<Props> = ({ projects }) => (
  <Layout
    title="Projects"
    description="Software and experiments I've built."
    ogType="website"
    canonicalUrl={`${SITE_URL}/projects`}
  >
    <section class="page-header">
      <h1>projects</h1>
    </section>

    {projects.length === 0 ? (
      <p class="empty">no projects yet</p>
    ) : (
      <>
        <details class="page-toc">
          <summary class="page-toc-toggle">contents</summary>
          <nav class="uses-toc" aria-label="projects contents">
            {Object.keys(STATUS_LABEL)
              .map((status) => ({
                status,
                items: projects.filter((p) => p.meta.status === status),
              }))
              .filter((group) => group.items.length > 0)
              .map((group) => (
                <div key={group.status} class="uses-toc-section">
                  <span class="uses-toc-label">{STATUS_LABEL[group.status]}</span>
                  <ul class="contents-list">
                    {group.items.map((p) => (
                      <li key={p.slug}>
                        <a href={`#${p.slug}`}>{p.meta.title}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </nav>
        </details>
        <ul class="project-list">
          {projects.map((p) => (
            <li
              key={p.slug}
              id={p.slug}
              class={p.meta.image ? 'project-card project-card--image' : 'project-card'}
            >
              {p.meta.image && (
                <div class="project-media">
                  <img src={p.meta.image} alt={p.meta.alt ?? p.meta.title} loading="lazy" />
                </div>
              )}
              <div class="project-body">
                <div class="project-main">
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
                    <div class="project-meta">
                      {p.meta.year && <span class="project-year">{p.meta.year}</span>}
                      {p.meta.year && <Sep />}
                      <span class={`status status--${p.meta.status}`}>
                        {STATUS_LABEL[p.meta.status] ?? p.meta.status}
                      </span>
                    </div>
                  </div>
                  <p
                    class="project-description"
                    dangerouslySetInnerHTML={{ __html: p.descriptionHtml }}
                  />
                </div>
                <div class="project-footer">
                  <div class="tags">
                    {(p.meta.tech ?? []).length > 0 && <Sep text="tech: " />}
                    {joinNodes(
                      (p.meta.tech ?? []).map((t) => (
                        <span key={t} class="tag">
                          {t}
                        </span>
                      ))
                    )}
                  </div>
                  <div class="project-links">
                    {joinNodes(
                      [
                        p.meta.source && (
                          <a
                            href={p.meta.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="project-link"
                          >
                            source
                          </a>
                        ),
                        ...(p.meta.links ?? []).map((link) => (
                          <a
                            key={link.href}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="project-link"
                          >
                            {link.label}
                          </a>
                        )),
                      ].filter(Boolean),
                      ' | '
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </>
    )}
  </Layout>
)
