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
    </head>
    <body>
      <header>
        <nav>
          <a href="/" class="site-title">kojin</a>
          <div class="nav-links">
            <a href="/blog">blog</a>
            <a href="/garden">garden</a>
            <a href="/photos">photos</a>
            <a href="/projects">projects</a>
          </div>
          <form action="/search" class="nav-search" role="search">
            <input type="search" name="q" placeholder="search" aria-label="search site" />
          </form>
        </nav>
      </header>
      <main class={mainClass}>{children}</main>
      <footer>
        <a href="/feed.xml">rss</a>
      </footer>
    </body>
  </html>
)
