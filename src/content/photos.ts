import path from 'path'
import fs from 'fs/promises'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import sharp from 'sharp'
import exifr from 'exifr'

const PHOTOS_DIR = `${process.cwd()}/content/photos`
const CACHE_DIR = `${process.cwd()}/cache/photos`
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

const noteProcessor = unified().use(remarkParse).use(remarkRehype).use(rehypeStringify)

export interface PhotoExif {
  camera?: string
  lens?: string
  focalLength?: string
  aperture?: string
  shutterSpeed?: string
  iso?: number
}

export interface Photo {
  filename: string
  base: string
  thumb: string
  medium: string
  exif?: PhotoExif
}

export interface DayEntry {
  date: string
  noteHtml?: string
  photos: Photo[]
}

async function listImageFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => [])
  return entries
    .filter((e) => e.isFile() && IMAGE_EXTS.has(path.extname(e.name).toLowerCase()) && !e.name.startsWith('_'))
    .map((e) => e.name)
    .sort()
}

async function readNote(dir: string): Promise<string | undefined> {
  const file = Bun.file(`${dir}/_note.md`)
  if (!(await file.exists())) return undefined
  return String(await noteProcessor.process(await file.text()))
}

async function readExif(filePath: string): Promise<PhotoExif | undefined> {
  try {
    const data = await exifr.parse(filePath, {
      pick: ['Make', 'Model', 'LensModel', 'FocalLength', 'FNumber', 'ExposureTime', 'ISO'],
    })
    if (!data) return undefined
    const et = data.ExposureTime
    const shutter = et ? (et >= 1 ? `${et}s` : `1/${Math.round(1 / et)}s`) : undefined
    return {
      camera: [data.Make, data.Model].filter(Boolean).join(' ') || undefined,
      lens: data.LensModel,
      focalLength: data.FocalLength ? `${Math.round(data.FocalLength)}mm` : undefined,
      aperture: data.FNumber ? `f/${data.FNumber}` : undefined,
      shutterSpeed: shutter,
      iso: data.ISO,
    }
  } catch {
    return undefined
  }
}

export async function processImage(dateSlug: string, base: string, originalPath: string): Promise<void> {
  const cacheDir = `${CACHE_DIR}/${dateSlug}`
  await fs.mkdir(cacheDir, { recursive: true })

  const thumbPath = `${cacheDir}/thumb-${base}.webp`
  const mediumPath = `${cacheDir}/medium-${base}.webp`

  if (!(await Bun.file(thumbPath).exists())) {
    await sharp(originalPath)
      .resize(null, 600, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(thumbPath)
  }

  if (!(await Bun.file(mediumPath).exists())) {
    await sharp(originalPath)
      .resize(1600, null, { withoutEnlargement: true })
      .webp({ quality: 87 })
      .toFile(mediumPath)
  }
}

async function findOriginal(dayDir: string, base: string): Promise<string | null> {
  for (const ext of ['.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG']) {
    const p = `${dayDir}/${base}${ext}`
    if (await Bun.file(p).exists()) return p
  }
  return null
}

export async function generateCachedImage(dateSlug: string, filename: string): Promise<string | null> {
  const match = filename.match(/^(thumb|medium)-(.+)\.webp$/)
  if (!match) return null
  const base = match[2]
  const original = await findOriginal(`${PHOTOS_DIR}/${dateSlug}`, base)
  if (!original) return null
  await processImage(dateSlug, base, original)
  const cachePath = `${CACHE_DIR}/${dateSlug}/${filename}`
  return (await Bun.file(cachePath).exists()) ? cachePath : null
}

export async function loadRoll(): Promise<DayEntry[]> {
  const entries = await fs.readdir(PHOTOS_DIR, { withFileTypes: true }).catch(() => [])
  const dateDirs = entries
    .filter((e) => e.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(e.name))
    .map((e) => e.name)
    .sort()
    .reverse()

  return Promise.all(
    dateDirs.map(async (date) => {
      const dayDir = `${PHOTOS_DIR}/${date}`
      const [files, noteHtml] = await Promise.all([listImageFiles(dayDir), readNote(dayDir)])
      const photos = await Promise.all(
        files.map(async (filename) => {
          const base = path.basename(filename, path.extname(filename))
          return {
            filename,
            base,
            thumb: `/photos/img/${date}/thumb-${base}.webp`,
            medium: `/photos/img/${date}/medium-${base}.webp`,
            exif: await readExif(`${dayDir}/${filename}`),
          }
        })
      )
      return { date, noteHtml, photos: photos.filter((p) => p !== null) }
    })
  )
}

export async function getRecentPhotos(count: number): Promise<Photo[]> {
  const entries = await fs.readdir(PHOTOS_DIR, { withFileTypes: true }).catch(() => [])
  const dateDirs = entries
    .filter((e) => e.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(e.name))
    .map((e) => e.name)
    .sort()
    .reverse()

  const results: Photo[] = []
  for (const date of dateDirs) {
    if (results.length >= count) break
    const files = await listImageFiles(`${PHOTOS_DIR}/${date}`)
    for (const file of files.slice(0, count - results.length)) {
      const base = path.basename(file, path.extname(file))
      results.push({ filename: file, base, thumb: `/photos/img/${date}/thumb-${base}.webp`, medium: `/photos/img/${date}/medium-${base}.webp` })
    }
  }
  return results
}
