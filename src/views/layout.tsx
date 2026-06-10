import type { FC, PropsWithChildren } from "hono/jsx";

type Props = PropsWithChildren<{
  title: string;
  description?: string;
  mainClass?: string;
}>;

export const Layout: FC<Props> = ({
  title,
  description,
  mainClass,
  children,
}) => (
  <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Moskas' Space — {title}</title>
      {description && <meta name="description" content={description} />}
      <link rel="stylesheet" href="/static/css/main.css" />
      <link rel="icon" href="/static/favicon.ico" />
      <link
        rel="alternate"
        type="application/atom+xml"
        href="/feed.xml"
        title="Moskas' Space"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);})();`,
        }}
      />
      <script src="/static/js/nav.js" defer></script>
      <script src="/static/js/theme.js" defer></script>
    </head>
    <body>
      <header>
        <nav>
          <a href="/" class="site-title">
            Moskas' Space
          </a>
          <div class="nav-links">
            <div class="nav-group">
              <span class="nav-group-label">content</span>
              <div class="nav-dropdown">
                <a href="/blog">blog</a>
                <a href="/bookshelf">bookshelf</a>
                <a href="/garden">garden</a>
                <a href="/photos">photos</a>
              </div>
            </div>
            <div class="nav-group">
              <span class="nav-group-label">me</span>
              <div class="nav-dropdown">
                <a href="/about">about</a>
                <a href="/projects">projects</a>
                <a href="/uses">uses</a>
                <a href="/now">now</a>
              </div>
            </div>
          </div>
          <div class="nav-end">
            <form action="/search" class="nav-search" role="search">
              <input
                type="search"
                name="q"
                placeholder="search"
                aria-label="search site"
              />
            </form>
            <button
              id="theme-toggle"
              class="theme-toggle"
              aria-label="auto mode"
            ></button>
            <details class="nav-mobile">
              <summary class="nav-hamburger">menu</summary>
              <div class="nav-mobile-links">
                <div class="nav-mobile-group">
                  <span class="nav-mobile-group-label">content</span>
                  <a href="/blog">blog</a>
                  <a href="/bookshelf">bookshelf</a>
                  <a href="/garden">garden</a>
                  <a href="/photos">photos</a>
                </div>
                <div class="nav-mobile-group">
                  <span class="nav-mobile-group-label">me</span>
                  <a href="/about">about</a>
                  <a href="/projects">projects</a>
                  <a href="/uses">uses</a>
                  <a href="/now">now</a>
                </div>
              </div>
            </details>
          </div>
        </nav>
      </header>
      <main class={mainClass}>{children}</main>
      <footer>
        <div class="footer-inner">
          <div class="footer-left">
            <a href="/about">Moskas</a>
            <span>2026</span>
          </div>
          <div class="footer-right">
            <a href="/feed.xml" aria-label="RSS feed" title="RSS feed">
              <svg
                class="footer-icon"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M19.199 24C19.199 13.467 10.533 4.8 0 4.8V0c13.165 0 24 10.835 24 24h-4.801zM3.291 17.415c1.814 0 3.293 1.479 3.293 3.295 0 1.813-1.485 3.29-3.301 3.29C1.47 24 0 22.526 0 20.71s1.475-3.294 3.291-3.295zM15.909 24h-4.665c0-6.169-5.075-11.245-11.244-11.245V8.09c8.727 0 15.909 7.184 15.909 15.91z" />
              </svg>
            </a>
            <a
              href="https://github.com/Moskas"
              aria-label="GitHub"
              title="GitHub"
              rel="noopener noreferrer"
              target="_blank"
            >
              <svg
                class="footer-icon"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </a>
            <a
              href="https://fosstodon.org/@Moskas"
              aria-label="Mastodon"
              title="Mastodon"
              rel="me noopener noreferrer"
              target="_blank"
            >
              <svg
                class="footer-icon"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.67 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12z" />
              </svg>
            </a>
            <a
              href="https://anilist.co/user/Moskas/"
              aria-label="AniList"
              title="AniList"
              rel="noopener noreferrer"
              target="_blank"
            >
              <svg
                class="footer-icon"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M24 17.53v2.421c0 .71-.391 1.101-1.1 1.101h-5l-.057-.165L11.84 3.736c.106-.502.46-.788 1.053-.788h2.422c.71 0 1.1.391 1.1 1.1v12.38H22.9c.71 0 1.1.392 1.1 1.101zM11.034 2.947l6.337 18.104h-4.918l-1.052-3.131H6.019l-1.077 3.131H0L6.361 2.948h4.673zm-.66 10.96-1.69-5.014-1.541 5.015h3.23z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </body>
  </html>
);
