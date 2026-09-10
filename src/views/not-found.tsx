import type { FC } from 'hono/jsx'
import { Layout } from './layout'

export const NotFound: FC = () => (
  <Layout title="404" description="Page not found" mainClass="not-found">
    <div class="not-found-content">
      <h1>404</h1>
      <p>This page doesn't exist.</p>
      <a href="/">← back home</a>
    </div>
  </Layout>
)
