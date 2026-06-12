import type { FC } from "hono/jsx";
import { Layout } from "../layout";
import type { TravelEntry } from "../../content/travels";

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

type Props = { entry: TravelEntry };

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const TravelDetail: FC<Props> = ({ entry }) => (
  <Layout
    title={`${entry.city} — travels`}
    description={entry.description}
    canonicalUrl={`${SITE_URL}/travels/${entry.country}/${entry.city}/${entry.date}`}
    ogImage={
      entry.photos[0] ? `${SITE_URL}${entry.photos[0].medium}` : undefined
    }
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
      <div
        class="travel-detail-note prose"
        dangerouslySetInnerHTML={{ __html: entry.noteHtml }}
      />
    )}

    {entry.photos.length > 0 && (
      <div class="travel-detail-strip">
        {entry.photos.map((photo, i) => (
          <button
            key={photo.base}
            class="roll-photo"
            aria-label={`Photo ${i + 1}`}
            data-medium={photo.medium}
            data-alt={`${entry.city} ${entry.date} — ${i + 1}`}
            data-exif=""
          >
            <img
              src={photo.thumb}
              alt={entry.city}
              loading={i < 6 ? "eager" : "lazy"}
              decoding="async"
            />
          </button>
        ))}
      </div>
    )}

    <div class="lightbox" id="lightbox" aria-hidden="true">
      <div class="lightbox-backdrop" id="lightbox-backdrop"></div>
      <div class="lightbox-content">
        <button class="lightbox-close" id="lightbox-close" aria-label="close">
          ✕
        </button>
        <button
          class="lightbox-prev"
          id="lightbox-prev"
          aria-label="previous photo"
        >
          ‹
        </button>
        <button
          class="lightbox-next"
          id="lightbox-next"
          aria-label="next photo"
        >
          ›
        </button>
        <img class="lightbox-img" id="lightbox-img" src="" alt="" />
        <p class="lightbox-exif" id="lightbox-exif"></p>
      </div>
    </div>

    <script src="/static/js/lightbox.js"></script>
  </Layout>
);
