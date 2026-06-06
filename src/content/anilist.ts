export interface MediaEntry {
  title: string
  progress: number
  total: number | null
  score: number | null
  status: string
  siteUrl: string
  coverImage: string
  updatedAt: number
}

export interface AnilistData {
  anime: MediaEntry[]
  manga: MediaEntry[]
}

const ANILIST_API = 'https://graphql.anilist.co'
const TTL = 5 * 60 * 1000

let cache: { data: AnilistData; ts: number } | null = null

const QUERY = `
  query ($userId: Int, $type: MediaType) {
    MediaListCollection(userId: $userId, type: $type, sort: UPDATED_TIME_DESC) {
      lists {
        entries {
          score(format: POINT_10_DECIMAL)
          progress
          status
          updatedAt
          media {
            title { romaji english }
            episodes
            chapters
            siteUrl
            coverImage { medium }
          }
        }
      }
    }
  }
`

async function fetchMediaList(userId: number, type: 'ANIME' | 'MANGA'): Promise<MediaEntry[]> {
  const res = await fetch(ANILIST_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query: QUERY, variables: { userId, type } }),
  })

  if (!res.ok) return []

  const json = await res.json()
  const lists: any[] = json.data?.MediaListCollection?.lists ?? []

  const entries: any[] = lists.flatMap((l: any) => l.entries ?? [])
  entries.sort((a, b) => b.updatedAt - a.updatedAt)

  return entries.slice(0, 5).map((e) => ({
    title: e.media?.title?.english || e.media?.title?.romaji || '',
    progress: e.progress ?? 0,
    total: type === 'ANIME' ? (e.media?.episodes ?? null) : (e.media?.chapters ?? null),
    score: e.score || null,
    status: e.status ?? '',
    siteUrl: e.media?.siteUrl ?? '',
    coverImage: e.media?.coverImage?.medium ?? '',
    updatedAt: e.updatedAt ?? 0,
  }))
}

export async function getAnilistData(): Promise<AnilistData> {
  if (cache && Date.now() - cache.ts < TTL) return cache.data

  const userId = parseInt(process.env.ANILIST_USER_ID ?? '0')
  if (!userId) return { anime: [], manga: [] }

  try {
    const [anime, manga] = await Promise.all([
      fetchMediaList(userId, 'ANIME'),
      fetchMediaList(userId, 'MANGA'),
    ])

    const data: AnilistData = { anime, manga }
    cache = { data, ts: Date.now() }
    return data
  } catch {
    return { anime: [], manga: [] }
  }
}
