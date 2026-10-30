import type { FC } from 'hono/jsx'
import { Layout } from '../layout'
import type { TravelEntry } from '../../content/travels'
import { joinNodes } from '../text-sep'

const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000'

type Props = { entry: TravelEntry }

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export const TravelDetail: FC<Props> = ({ entry }) => (
  <Layout
    title={`${entry.city} — travels`}
    description={entry.description}
    canonicalUrl={`${SITE_URL}/travels/${entry.country}/${entry.city}/${entry.date}`}
    ogImage={entry.photos[0] ? `${SITE_URL}${entry.photos[0].medium}` : undefined}
    ogType="article"
  >
    <section class="page-header">
      <h1>
        travels / {entry.country} / {entry.city}
      </h1>
      <p class="page-description">
        <time dateTime={entry.date}>{formatDate(entry.date)}</time>
      </p>
    </section>

    {entry.description && <p class="travel-detail-desc">{entry.description}</p>}

    <p class="travel-detail-back">
      <a href="/travels">← travels</a>
    </p>

    {entry.noteHtml && (
      <div class="travel-detail-note prose" dangerouslySetInnerHTML={{ __html: entry.noteHtml }} />
    )}

    {entry.photos.length > 0 && (
      <div class="travel-detail-strip">
        {joinNodes(
          entry.photos.map((photo, i) => (
            <a
              key={photo.base}
              href={photo.medium}
              class="roll-photo"
              data-alt={`${entry.city} ${entry.date} — ${i + 1}`}
              data-exif=""
            >
              <img
                src={photo.thumb}
                alt={`${entry.city} photo ${i + 1} of ${entry.photos.length}`}
                loading={i < 6 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </a>
          )),
          ' | '
        )}
      </div>
    )}

    <script src="/static/js/lightbox.js"></script>
  </Layout>
)
