export interface Track {
  artist: string
  title: string
  album: string
  nowPlaying: boolean
  url: string
  ts: number | null
}

export interface LastfmData {
  nowPlaying: Track | null
  recent: Track[]
}

const LASTFM_API = 'https://ws.audioscrobbler.com/2.0/'
const TTL = 5 * 60 * 1000

let cache: { data: LastfmData; ts: number } | null = null

function parseTrack(t: any): Track {
  return {
    artist: t.artist?.['#text'] ?? '',
    title: t.name ?? '',
    album: t.album?.['#text'] ?? '',
    nowPlaying: t['@attr']?.nowplaying === 'true',
    url: t.url ?? '',
    ts: t.date?.uts ? parseInt(t.date.uts) : null,
  }
}

export async function getLastfmData(): Promise<LastfmData> {
  if (cache && Date.now() - cache.ts < TTL) return cache.data

  const username = process.env.LASTFM_USERNAME ?? ''
  const apiKey = process.env.LASTFM_API_KEY ?? ''

  if (!username || !apiKey) return { nowPlaying: null, recent: [] }

  try {
    const url = `${LASTFM_API}?method=user.getRecentTracks&user=${encodeURIComponent(username)}&api_key=${apiKey}&format=json&limit=6`
    const res = await fetch(url)
    if (!res.ok) return { nowPlaying: null, recent: [] }

    const json = await res.json()
    const tracks: any[] = json.recenttracks?.track ?? []

    const all = tracks.map(parseTrack)
    const nowPlaying = all[0]?.nowPlaying ? all[0] : null
    const recent = (nowPlaying ? all.slice(1) : all).slice(0, 5)

    const data: LastfmData = { nowPlaying, recent }
    cache = { data, ts: Date.now() }
    return data
  } catch {
    return { nowPlaying: null, recent: [] }
  }
}
