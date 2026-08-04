import path from 'path'
import fs from 'fs/promises'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import sharp from 'sharp'

const TRAVELS_DIR = `${process.cwd()}/content/travel`
const CACHE_DIR = `${process.cwd()}/cache/travels`
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

const noteProcessor = unified().use(remarkParse).use(remarkRehype).use(rehypeStringify)

export interface TravelPhoto {
  filename: string
  base: string
  thumb: string
  medium: string
}

export interface TravelEntry {
  country: string
  city: string
  date: string
  year: string
  description?: string
  noteHtml?: string
  photos: TravelPhoto[]
}

export interface TravelCity {
  city: string
  entries: TravelEntry[]
  noteHtml?: string
}

export interface TravelCountry {
  country: string
  cities: TravelCity[]
  noteHtml?: string
}

async function listImageFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => [])
  return entries
    .filter((e) => e.isFile() && IMAGE_EXTS.has(path.extname(e.name).toLowerCase()) && !e.name.startsWith('_'))
    .map((e) => e.name)
    .sort()
}

async function readNote(dir: string): Promise<{ html?: string; description?: string; preview?: string[] }> {
  const file = Bun.file(`${dir}/_note.md`)
  if (!(await file.exists())) return {}
  const raw = await file.text()
  const { data, content } = matter(raw)
  const html = String(await noteProcessor.process(content))
  return {
    html: content.trim() ? html : undefined,
    description: data.description,
    preview: Array.isArray(data.preview) ? data.preview : undefined,
  }
}

async function processImage(cacheKey: string, base: string, originalPath: string): Promise<void> {
  const cacheDir = `${CACHE_DIR}/${cacheKey}`
  await fs.mkdir(cacheDir, { recursive: true })

  const thumbPath = `${cacheDir}/thumb-${base}.webp`
  const mediumPath = `${cacheDir}/medium-${base}.webp`

  if (!(await Bun.file(thumbPath).exists())) {
    await sharp(originalPath)
      .rotate()
      .resize(null, 600, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(thumbPath)
  }

  if (!(await Bun.file(mediumPath).exists())) {
    await sharp(originalPath)
      .rotate()
      .resize(1600, null, { withoutEnlargement: true })
      .webp({ quality: 87 })
      .toFile(mediumPath)
  }
}

async function findOriginal(dir: string, base: string): Promise<string | null> {
  for (const ext of ['.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG']) {
    const p = `${dir}/${base}${ext}`
    if (await Bun.file(p).exists()) return p
  }
  return null
}

export async function generateCachedImage(
  country: string,
  city: string,
  date: string,
  filename: string
): Promise<string | null> {
  const match = filename.match(/^(thumb|medium)-(.+)\.webp$/)
  if (!match) return null
  const base = match[2]
  const entryDir = `${TRAVELS_DIR}/${country}/${city}/${date}`
  const original = await findOriginal(entryDir, base)
  if (!original) return null
  const cacheKey = `${country}/${city}/${date}`
  await processImage(cacheKey, base, original)
  const cachePath = `${CACHE_DIR}/${cacheKey}/${filename}`
  return (await Bun.file(cachePath).exists()) ? cachePath : null
}

function makePhotos(files: string[], country: string, city: string, date: string, limit?: number): TravelPhoto[] {
  const subset = limit ? files.slice(0, limit) : files
  return subset.map((filename) => {
    const base = path.basename(filename, path.extname(filename))
    return {
      filename,
      base,
      thumb: `/travels/img/${country}/${city}/${date}/thumb-${base}.webp`,
      medium: `/travels/img/${country}/${city}/${date}/medium-${base}.webp`,
    }
  })
}

export async function loadTravels(): Promise<TravelCountry[]> {
  const countryEntries = await fs.readdir(TRAVELS_DIR, { withFileTypes: true }).catch(() => [])
  const countryDirs = countryEntries
    .filter((e) => e.isDirectory() && !e.name.startsWith('_'))
    .map((e) => e.name)
    .sort()

  const countries = await Promise.all(
    countryDirs.map(async (country) => {
      const countryPath = `${TRAVELS_DIR}/${country}`
      const [cityEntries, countryNote] = await Promise.all([
        fs.readdir(countryPath, { withFileTypes: true }).catch(() => []),
        readNote(countryPath),
      ])
      const cityDirs = cityEntries
        .filter((e) => e.isDirectory() && !e.name.startsWith('_'))
        .map((e) => e.name)
        .sort()

      const cities = await Promise.all(
        cityDirs.map(async (city) => {
          const cityPath = `${countryPath}/${city}`
          const [dateEntries, cityNote] = await Promise.all([
            fs.readdir(cityPath, { withFileTypes: true }).catch(() => []),
            readNote(cityPath),
          ])
          const dateDirs = dateEntries
            .filter((e) => e.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(e.name))
            .map((e) => e.name)
            .sort()
            .reverse()

          const entries = await Promise.all(
            dateDirs.map(async (date) => {
              const entryDir = `${cityPath}/${date}`
              const [files, note] = await Promise.all([listImageFiles(entryDir), readNote(entryDir)])
              const previewFiles = note.preview
                ? note.preview.filter((f) => files.includes(f))
                : files.slice(0, 6)
              return {
                country,
                city,
                date,
                year: date.slice(0, 4),
                description: note.description,
                photos: makePhotos(previewFiles, country, city, date),
              } satisfies TravelEntry
            })
          )

          return { city, entries, noteHtml: cityNote.html } satisfies TravelCity
        })
      )

      return {
        country,
        cities: cities.filter((c) => c.entries.length > 0),
        noteHtml: countryNote.html,
      } satisfies TravelCountry
    })
  )

  return countries.filter((c) => c.cities.length > 0)
}

export async function loadEntry(country: string, city: string, date: string): Promise<TravelEntry | null> {
  const entryDir = `${TRAVELS_DIR}/${country}/${city}/${date}`
  const [files, note] = await Promise.all([listImageFiles(entryDir), readNote(entryDir)])
  if (files.length === 0 && !note.html) return null

  return {
    country,
    city,
    date,
    year: date.slice(0, 4),
    description: note.description,
    noteHtml: note.html,
    photos: makePhotos(files, country, city, date),
  }
}
