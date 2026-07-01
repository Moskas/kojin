import type { FC } from 'hono/jsx'
import { Layout } from '../layout'
import type { LastfmData, Track } from '../../content/lastfm'
import type { AnilistData, MediaEntry } from '../../content/anilist'

type Props = {
  nowHtml: string
  updated: string
  lastfm: LastfmData
  anilist: AnilistData
}

function timeAgo(unixSecs: number): string {
  const diff = Math.floor(Date.now() / 1000) - unixSecs
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`
  return `${Math.floor(diff / 2592000)}mo ago`
}

const TrackItem: FC<{ track: Track }> = ({ track }) => (
  <li class="now-track">
    <a href={track.url} target="_blank" rel="noopener noreferrer">
      {track.title}
    </a>
    <span class="now-track-meta"> — {track.artist}</span>
    {track.ts && <span class="now-timestamp">{timeAgo(track.ts)}</span>}
  </li>
)

function statusLabel(status: string, type: 'anime' | 'manga'): string {
  switch (status) {
    case 'CURRENT': return type === 'anime' ? 'watching' : 'reading'
    case 'REPEATING': return type === 'anime' ? 'rewatching' : 'rereading'
    case 'COMPLETED': return 'completed'
    case 'PAUSED': return 'on hold'
    case 'DROPPED': return 'dropped'
    case 'PLANNING': return type === 'anime' ? 'plan to watch' : 'plan to read'
    default: return status.toLowerCase()
  }
}

const showProgress = (status: string) =>
  status === 'CURRENT' || status === 'REPEATING' || status === 'COMPLETED'

const MediaItem: FC<{ entry: MediaEntry; type: 'anime' | 'manga' }> = ({ entry, type }) => {
  const progressStr = entry.total ? `${entry.progress} / ${entry.total}` : `${entry.progress}`
  return (
    <li class="now-media-item">
      {entry.coverImage && (
        <div class="now-media-cover">
          <img src={entry.coverImage} alt="" loading="lazy" />
        </div>
      )}
      <div class="now-media-info">
        <a href={entry.siteUrl} target="_blank" rel="noopener noreferrer">
          {entry.title}
        </a>
        <dl class="now-media-stats">
          <div class="now-media-stat">
            <dt>status</dt>
            <dd>{statusLabel(entry.status, type)}</dd>
          </div>
          {showProgress(entry.status) && (
            <div class="now-media-stat">
              <dt>progress</dt>
              <dd>{progressStr}</dd>
            </div>
          )}
          {entry.score && (
            <div class="now-media-stat">
              <dt>score</dt>
              <dd>{entry.score} / 10</dd>
            </div>
          )}
          {entry.updatedAt > 0 && (
            <div class="now-media-stat">
              <dt>updated</dt>
              <dd>{timeAgo(entry.updatedAt)}</dd>
            </div>
          )}
        </dl>
      </div>
    </li>
  )
}

export const NowPage: FC<Props> = ({ nowHtml, updated, lastfm, anilist }) => (
  <Layout title="Now">
    <section class="page-header">
      <h1>now</h1>
      {updated && <p class="page-description">updated {updated}</p>}
    </section>

    <div class="prose" dangerouslySetInnerHTML={{ __html: nowHtml }} />

    {(lastfm.nowPlaying || lastfm.recent.length > 0) && (
      <section class="now-section">
        <h2 class="now-section-title">last.fm</h2>

        {lastfm.nowPlaying && (
          <p class="now-playing">
            <span class="now-playing-badge">[live]</span>{' '}
            <a href={lastfm.nowPlaying.url} target="_blank" rel="noopener noreferrer">
              {lastfm.nowPlaying.title}
            </a>
            <span class="now-track-meta"> — {lastfm.nowPlaying.artist}</span>
          </p>
        )}

        {lastfm.recent.length > 0 && (
          <ul class="now-track-list">
            {lastfm.recent.map((t, i) => (
              <TrackItem key={i} track={t} />
            ))}
          </ul>
        )}
      </section>
    )}

    {(anilist.anime.length > 0 || anilist.manga.length > 0) && (
      <section class="now-section">
        <h2 class="now-section-title">anilist</h2>

        <div class="now-anilist-grid">
          {anilist.anime.length > 0 && (
            <div class="now-media-col">
              <h3 class="now-media-label">anime</h3>
              <ul class="now-media-list">
                {anilist.anime.map((e, i) => (
                  <MediaItem key={i} entry={e} type="anime" />
                ))}
              </ul>
            </div>
          )}

          {anilist.manga.length > 0 && (
            <div class="now-media-col">
              <h3 class="now-media-label">manga</h3>
              <ul class="now-media-list">
                {anilist.manga.map((e, i) => (
                  <MediaItem key={i} entry={e} type="manga" />
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    )}
  </Layout>
)
