import type { FC } from 'hono/jsx'
import { Layout } from '../layout'
import type { UsesData, UsesSection, UsesItem } from '../../content/uses'

type Props = { uses: UsesData }

const UsesCard: FC<{ item: UsesItem; sectionId: string }> = ({ item, sectionId }) => (
  <article id={item.id} class={`uses-item uses-item--${sectionId}`}>
    <h3 class="uses-item-name">
      {item.url ? (
        <a href={item.url} target="_blank" rel="noopener noreferrer">{item.name}</a>
      ) : (
        <a href={`#${item.id}`}>{item.name}</a>
      )}
    </h3>
    <div class="uses-item-body" dangerouslySetInnerHTML={{ __html: item.bodyHtml }} />
  </article>
)

const SectionContent: FC<{ section: UsesSection }> = ({ section }) => {
  if (section.items.length === 0) {
    return <p class="empty">no items listed yet</p>
  }
  if (section.layout === 'grid') {
    return (
      <div class="uses-software-grid">
        {section.items.map((item) => (
          <UsesCard key={item.id} item={item} sectionId={section.id} />
        ))}
      </div>
    )
  }
  return (
    <>
      {section.items.map((item) => (
        <UsesCard key={item.id} item={item} sectionId={section.id} />
      ))}
    </>
  )
}

export const UsesPage: FC<Props> = ({ uses }) => (
  <Layout title="Uses">
    <section class="page-header">
      <h1>uses</h1>
    </section>

    <nav class="uses-toc" aria-label="page contents">
      {uses.map((section) => (
        <div key={section.id} class="uses-toc-section">
          <span class="uses-toc-label">{section.title}</span>
          {section.items.map((item) => (
            <a key={item.id} href={`#${item.id}`}>{item.name}</a>
          ))}
        </div>
      ))}
    </nav>

    {uses.map((section) => (
      <section key={section.id} id={section.id} class="uses-section">
        <h2 class="uses-section-title">{section.title}</h2>
        <SectionContent section={section} />
      </section>
    ))}
  </Layout>
)
