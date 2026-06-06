import type { FC } from 'hono/jsx'
import { Layout } from '../layout'
import type { UsesData, HardwareItem, SoftwareItem } from '../../content/uses'

type Props = { uses: UsesData }

const HardwareCard: FC<{ item: HardwareItem }> = ({ item }) => (
  <article id={item.id} class="uses-item uses-item--hardware">
    <h3 class="uses-item-name">
      <a href={`#${item.id}`}>{item.name}</a>
    </h3>
    <div class="uses-item-body" dangerouslySetInnerHTML={{ __html: item.bodyHtml }} />
  </article>
)

const SoftwareCard: FC<{ item: SoftwareItem }> = ({ item }) => (
  <article id={item.id} class="uses-item uses-item--software">
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

export const UsesPage: FC<Props> = ({ uses }) => (
  <Layout title="Uses">
    <section class="page-header">
      <h1>uses</h1>
    </section>

    <nav class="uses-toc" aria-label="page contents">
      <div class="uses-toc-section">
        <span class="uses-toc-label">hardware</span>
        {uses.hardware.map((h) => (
          <a key={h.id} href={`#${h.id}`}>{h.name}</a>
        ))}
      </div>
      <div class="uses-toc-section">
        <span class="uses-toc-label">software</span>
        {uses.software.map((s) => (
          <a key={s.id} href={`#${s.id}`}>{s.name}</a>
        ))}
      </div>
    </nav>

    <section id="hardware" class="uses-section">
      <h2 class="uses-section-title">hardware</h2>
      {uses.hardware.length === 0 ? (
        <p class="empty">no hardware listed yet</p>
      ) : (
        uses.hardware.map((item) => <HardwareCard key={item.id} item={item} />)
      )}
    </section>

    <section id="software" class="uses-section">
      <h2 class="uses-section-title">software</h2>
      {uses.software.length === 0 ? (
        <p class="empty">no software listed yet</p>
      ) : (
        <div class="uses-software-grid">
          {uses.software.map((item) => <SoftwareCard key={item.id} item={item} />)}
        </div>
      )}
    </section>
  </Layout>
)
