---
title: Hello World
date: 2026-01-01
tags: [meta]
description: The first post on kojin.
---

This is the first post with kojin — my personal site built with Bun and Hono.

## What this site is

A place to write, think out loud, and keep a record of things I find interesting.

- **Blog** — longer-form writing, infrequently
- **Garden** — notes in various states of development
- **Photos** — pictures I've taken
- **Projects** — things I've built

## The stack

Built with [Bun](https://bun.sh) and [Hono](https://hono.dev). Markdown parsed with [unified](https://unifiedjs.com). Plain CSS, no frameworks. Deployable as a single binary.

```typescript
export default {
  port: 3000,
  fetch: app.fetch,
}
```

More to come.
