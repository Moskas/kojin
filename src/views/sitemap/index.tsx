import type { FC } from 'hono/jsx'
import { Layout } from '../layout'

export interface SitemapLink {
  url: string
  label: string
}

export interface SitemapSection {
  id: string
  title: string
  links: SitemapLink[]
}

type Props = { sections: SitemapSection[] }

const SitemapGroup: FC<{ section: SitemapSection }> = ({ section }) => (
  <section id={section.id} class="sitemap-section">
    <h2>
      <span class="hash">#</span>
      {section.title}
    </h2>
    <ul class="sitemap-list">
      {section.links.map((link) => (
        <li key={link.url}>
          <a href={link.url}>{link.label}</a>
          <span class="sitemap-url">{link.url}</span>
        </li>
      ))}
    </ul>
  </section>
)

export const SitemapPage: FC<Props> = ({ sections }) => (
  <Layout title="Sitemap">
    <section class="page-header">
      <h1>sitemap</h1>
    </section>
    <div class="sitemap">
      {sections.map((s) => (
        <SitemapGroup key={s.id} section={s} />
      ))}
    </div>
  </Layout>
)
