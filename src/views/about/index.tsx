import type { FC } from 'hono/jsx'
import { Layout } from '../layout'

type Props = { html: string }

export const AboutPage: FC<Props> = ({ html }) => (
  <Layout title="About" description="About Moskas">
    <section class="page-header">
      <h1>about</h1>
    </section>
    <div class="prose" dangerouslySetInnerHTML={{ __html: html }} />
  </Layout>
)
