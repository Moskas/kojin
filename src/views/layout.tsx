import type { FC, PropsWithChildren } from 'hono/jsx'

type Props = PropsWithChildren<{
  title: string
  description?: string
  mainClass?: string
}>

export const Layout: FC<Props> = ({ title, description, mainClass, children }) => (
  <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{title} — kojin</title>
      {description && <meta name="description" content={description} />}
      <link rel="stylesheet" href="/static/css/main.css" />
      <link rel="alternate" type="application/atom+xml" href="/feed.xml" title="kojin" />
      <script src="/static/js/nav.js" defer></script>
    </head>
    <body>
      <header>
        <nav>
          <a href="/" class="site-title">kojin</a>
          <div class="nav-links">
            <div class="nav-group">
              <span class="nav-group-label">content</span>
              <div class="nav-dropdown">
                <a href="/blog">blog</a>
                <a href="/garden">garden</a>
                <a href="/photos">photos</a>
              </div>
            </div>
            <div class="nav-group">
              <span class="nav-group-label">me</span>
              <div class="nav-dropdown">
                <a href="/now">now</a>
                <a href="/projects">projects</a>
                <a href="/uses">uses</a>
              </div>
            </div>
          </div>
          <div class="nav-end">
            <form action="/search" class="nav-search" role="search">
              <input type="search" name="q" placeholder="search" aria-label="search site" />
            </form>
            <details class="nav-mobile">
              <summary class="nav-hamburger">menu</summary>
              <div class="nav-mobile-links">
                <div class="nav-mobile-group">
                  <span class="nav-mobile-group-label">content</span>
                  <a href="/blog">blog</a>
                  <a href="/garden">garden</a>
                  <a href="/photos">photos</a>
                </div>
                <div class="nav-mobile-group">
                  <span class="nav-mobile-group-label">me</span>
                  <a href="/now">now</a>
                  <a href="/projects">projects</a>
                  <a href="/uses">uses</a>
                </div>
              </div>
            </details>
          </div>
        </nav>
      </header>
      <main class={mainClass}>{children}</main>
      <footer>
        <a href="/feed.xml">rss</a>
      </footer>
    </body>
  </html>
)
