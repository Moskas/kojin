import { Hono } from 'hono'
import {
  listNotes,
  resolveBacklinks,
  filterNotes,
  NOTE_STATUSES,
} from '../content/garden'
import type { GardenQuery, NoteStatus } from '../content/garden'
import { GardenIndex } from '../views/garden/index'
import { GardenNote } from '../views/garden/note'

const GARDEN_DIR = `${process.cwd()}/content/garden`

export const gardenRoutes = new Hono()

gardenRoutes.get('/', async (c) => {
  const rawStatus = c.req.query('status') ?? 'all'
  const rawSort = c.req.query('sort') ?? 'updated'
  const tag = c.req.query('tag') || undefined

  const query: GardenQuery = {
    status: NOTE_STATUSES.includes(rawStatus as NoteStatus) ? (rawStatus as NoteStatus) : 'all',
    sort: rawSort === 'title' ? 'title' : 'updated',
    tag,
  }

  const allNotes = await listNotes(GARDEN_DIR)
  const allTags = [...new Set(allNotes.flatMap((n) => n.frontmatter.tags ?? []))].sort()
  const notes = filterNotes(allNotes, query)
  return c.html(<GardenIndex notes={notes} allTags={allTags} query={query} />)
})

gardenRoutes.get('/:slug', async (c) => {
  const slug = c.req.param('slug')
  // Prev/next follow the index's default order
  const notes = filterNotes(await listNotes(GARDEN_DIR), { status: 'all', sort: 'updated' })
  const idx = notes.findIndex((n) => n.slug === slug)
  if (idx === -1) return c.notFound()

  const note = notes[idx]
  const toNav = (n?: (typeof notes)[number]) =>
    n && { slug: n.slug, title: n.frontmatter.title ?? n.slug }
  const backlinkEntries = await resolveBacklinks(GARDEN_DIR, note.slug, note.backlinks)
  return c.html(
    <GardenNote
      note={note}
      backlinks={backlinkEntries}
      prev={toNav(notes[idx - 1])}
      next={toNav(notes[idx + 1])}
    />
  )
})
