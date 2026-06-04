import { Database } from 'bun:sqlite'

let db: Database | null = null

export function getDb(): Database {
  if (!db) {
    db = new Database(process.env.DB_PATH ?? 'kojin.db')
    initSchema(db)
  }
  return db
}

function initSchema(db: Database): void {
  db.run(`
    CREATE VIRTUAL TABLE IF NOT EXISTS search USING fts5(
      slug, title, body, section
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS backlinks (
      source TEXT NOT NULL,
      target TEXT NOT NULL,
      PRIMARY KEY (source, target)
    )
  `)
}

export function clearSearchIndex(): void {
  getDb().run('DELETE FROM search')
}

export function clearBacklinks(): void {
  getDb().run('DELETE FROM backlinks')
}

export function indexContent(slug: string, title: string, body: string, section: string): void {
  const db = getDb()
  db.run(
    `INSERT INTO search(slug, title, body, section) VALUES (?, ?, ?, ?)`,
    [slug, title, body, section]
  )
}

export function searchContent(query: string) {
  const db = getDb()
  return db
    .query(`SELECT slug, title, section FROM search WHERE search MATCH ? ORDER BY rank LIMIT 20`)
    .all(query)
}

export function upsertBacklink(source: string, target: string): void {
  const db = getDb()
  db.run(`INSERT OR IGNORE INTO backlinks(source, target) VALUES (?, ?)`, [source, target])
}

export function getBacklinks(target: string): string[] {
  const db = getDb()
  const rows = db
    .query(`SELECT source FROM backlinks WHERE target = ?`)
    .all(target) as { source: string }[]
  return rows.map((r) => r.source)
}
