import { Hono } from 'hono'
import { listNotes, loadNote, resolveBacklinks } from '../content/garden'
import { GardenIndex } from '../views/garden/index'
import { GardenNote } from '../views/garden/note'

const GARDEN_DIR = `${process.cwd()}/content/garden`

export const gardenRoutes = new Hono()

gardenRoutes.get('/', async (c) => {
  const notes = await listNotes(GARDEN_DIR)
  return c.html(<GardenIndex notes={notes} />)
})

gardenRoutes.get('/:slug', async (c) => {
  const slug = c.req.param('slug')
  const note = await loadNote(GARDEN_DIR, slug)
  if (!note) return c.notFound()

  const backlinkEntries = await resolveBacklinks(GARDEN_DIR, note.backlinks)
  return c.html(<GardenNote note={note} backlinks={backlinkEntries} />)
})
