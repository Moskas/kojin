# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development environment

This project requires Bun and system `vips` (for sharp). Both are provided via the Nix flake — always work inside the devshell:

```
nix develop        # enter the shell (direnv does this automatically via .envrc)
bun run dev        # start server with file watching on http://localhost:3000
bun run build      # compile to a single binary: ./kojin
bun run start      # run without watch
```

The server must be started from the project root because content paths are resolved with `process.cwd()`.

## NixOS / sharp

The flake `shellHook` sets `LD_LIBRARY_PATH` to expose `libstdc++.so.6` and `libvips`. Without this, the sharp prebuilt binary fails to load. Do not remove those exports.

## Architecture

The server is a Hono app (`src/server.ts`) that:
1. Calls `buildIndexes()` at startup — clears and rebuilds the SQLite FTS5 search index and backlink table from all content on disk.
2. Mounts route modules under their URL prefixes.
3. Serves `src/static/` directly via `serveStatic`.

### Route → view → content layer

Each section follows the same pattern:

```
src/routes/<section>.tsx   — Hono route handlers, calls content functions, renders views
src/views/<section>/       — Hono JSX components (server-rendered, no client JS framework)
src/content/<section>.ts   — reads/parses files from content/, returns typed structs
```

### Content directories

```
content/blog/       YYYY-MM-DD-slug.md   frontmatter: title, date, tags[], draft, description
content/garden/     slug.md              frontmatter: title, tags[], created, updated
content/photos/     YYYY-MM-DD/          one directory per day; drop JPEGs in; _note.md optional
content/projects/   slug.md              frontmatter: title, description, tech[], url, source, status, year
content/about.md                         rendered on the home page
```

### Slugs

- Blog: filename `2026-01-15-my-post.md` → URL slug `my-post` (date prefix stripped)
- Garden: filename `note-name.md` → URL slug `note-name`
- Photos: directory name is the date (`YYYY-MM-DD`); used as the cache key

### Database (`src/db/index.ts`)

SQLite via `bun:sqlite`, file `kojin.db` (gitignored). Two tables:

- `search` — FTS5 virtual table, rebuilt on every server start via `buildIndexes()`
- `backlinks(source, target)` — populated by `buildIndexes()` (regex scan) and also live by the `wikiLinksPlugin` during note renders

### Image processing (`src/content/photos.ts`)

sharp resizes on first request and caches results to `cache/photos/<date>/` (gitignored):
- `thumb-<base>.webp` — 600px height, natural width (preserves aspect ratio for the roll strip)
- `medium-<base>.webp` — 1600px wide

The `/photos/img/:date/:filename` route triggers generation if the cache file is missing, then streams the webp.

### Garden wiki-links

`[[target-slug]]` and `[[target-slug|display text]]` syntax is handled by `wikiLinksPlugin` in `src/content/garden.ts`, a custom remark plugin that rewrites text nodes into link nodes and records backlinks in SQLite.

### JSX

All views use Hono JSX (`jsxImportSource: "hono/jsx"` in `tsconfig.json`). HTML attributes use standard HTML names (`class`, not `className`). `dangerouslySetInnerHTML={{ __html: ... }}` is used to inject remark-rendered HTML — the author controls all content so this is intentional.

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | HTTP listen port |
| `DB_PATH` | `kojin.db` | SQLite file path |
| `SITE_URL` | `http://localhost:3000` | Used in Atom feed |
| `SITE_AUTHOR` | `kojin` | Used in Atom feed |

## Deployment

`bun run build` produces a self-contained binary. Copy `kojin` + `content/` + `src/static/` to the server. `deploy/kojin.service` and `deploy/nginx.conf` are templates — replace `yourdomain.com` and fill env vars before use.
