# kojin

Personal website behind [moskas.space](https://moskas.space): blog, digital garden, photo roll,
travel logs, and personal lists. Pages are server-rendered from files in `content/`, and the site
works with JavaScript disabled.

Built with [Bun](https://bun.sh), [Hono](https://hono.dev) JSX, SQLite (FTS5), and
[sharp](https://sharp.pixelplumbing.com).

## Features

- Markdown blog with tags and an Atom feed
- Digital garden with `[[wiki-links]]` and backlinks
- Photo roll with resized WebP images generated on first request and cached on disk
- Full-text search
- Travel logs, projects, bookshelf, watchlist, uses, and now pages
- Optional Last.fm and AniList data on the now page

## Development

Bun and `vips` are provided by the Nix flake. Run everything inside the devshell, which also sets
the `LD_LIBRARY_PATH` that sharp needs on NixOS.

```sh
nix develop      # or let direnv load it
bun install
bun run dev      # http://localhost:3000, restarts on file changes
```

Start the server from the project root, because content paths are resolved from the working
directory.

| Command         | Purpose                     |
| --------------- | --------------------------- |
| `bun run dev`   | Start with file watching    |
| `bun run start` | Start without file watching |
| `bun run build` | Compile to `./kojin`        |
| `bun run lint`  | Typecheck                   |
| `nix fmt`       | Format with treefmt         |

## Project layout

```
src/server.tsx   Entry point, route mounting, index build
src/routes/      Hono route handlers
src/views/       Server-rendered JSX components
src/content/     Content loading and parsing
src/db/          SQLite search index and backlinks
src/static/      CSS, JS, fonts, images
content/         Site content
deploy/          systemd and nginx templates
```

## Content

| Path                                      | Contents                                  |
| ----------------------------------------- | ----------------------------------------- |
| `content/landing.md`                      | Home page text                            |
| `content/about.md`                        | About page                                |
| `content/now.md`                          | Now page                                  |
| `content/blog/YYYY-MM-DD-slug.md`         | Blog post, served at `/blog/slug`         |
| `content/garden/slug.md`                  | Garden note, served at `/garden/slug`     |
| `content/projects/slug.md`                | Project entry                             |
| `content/photos/YYYY-MM-DD/`              | Images for one day, optional `_note.md`   |
| `content/travel/country/city/YYYY-MM-DD/` | Images for one trip, optional `_note.md`  |
| `content/uses/section/`                   | Entries, section settings in `_meta.yaml` |
| `content/bookshelf/section/`              | Entries, section settings in `_meta.yaml` |
| `content/watchlist/section/`              | Entries, section settings in `_meta.yaml` |

The search index and backlink table are rebuilt at startup, so new content is not searchable until
the server restarts.

## Configuration

All variables are optional. The now page integrations need their variables set to show data.

| Variable          | Default                 | Purpose                 |
| ----------------- | ----------------------- | ----------------------- |
| `PORT`            | `3000`                  | HTTP listen port        |
| `DB_PATH`         | `kojin.db`              | SQLite file path        |
| `SITE_URL`        | `http://localhost:3000` | Public URL of the site  |
| `SITE_AUTHOR`     | `kojin`                 | Feed author name        |
| `LASTFM_API_KEY`  |                         | Last.fm API key         |
| `LASTFM_USERNAME` |                         | Last.fm username        |
| `ANILIST_USER_ID` |                         | AniList numeric user ID |

## Deployment

### NixOS

The flake provides a package and a NixOS module. The package includes `content/`, so publishing new
content means rebuilding it.

```nix
# flake input: inputs.kojin.url = "github:Moskas/kojin";
{
  imports = [ inputs.kojin.nixosModules.default ];

  services.kojin = {
    enable = true;
    siteUrl = "https://example.com";
    siteAuthor = "Your Name";
    # Secret KEY=VALUE file for the now page variables
    environmentFile = config.sops.secrets.kojin-env.path;
  };
}
```

Other options are `port`, `package`, and `openFirewall`. State is kept in `/var/lib/kojin`.

### Compiled binary

`bun run build` produces `./kojin`, which is not fully self-contained: sharp is loaded at runtime.
The working directory needs `content/`, `src/static/`, and `node_modules/`, and `LD_LIBRARY_PATH`
must expose `libstdc++.so.6` on NixOS.

`deploy/kojin.service` and `deploy/nginx.conf` are templates. Replace `yourdomain.com` and fill in
the environment variables.

## License

[MIT](LICENSE)
