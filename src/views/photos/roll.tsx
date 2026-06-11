import type { FC } from "hono/jsx";
import { Layout } from "../layout";
import type { DayEntry, PhotoExif } from "../../content/photos";

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

type Props = { days: DayEntry[] };

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function exifString(exif: PhotoExif): string {
  return [
    exif.camera,
    [
      exif.focalLength,
      exif.aperture,
      exif.shutterSpeed,
      exif.iso ? `ISO ${exif.iso}` : undefined,
    ]
      .filter(Boolean)
      .join("  "),
  ]
    .filter(Boolean)
    .join("  —  ");
}

export const PhotoRoll: FC<Props> = ({ days }) => (
  <Layout
    title="Photos"
    description="A photo journal."
    ogType="website"
    canonicalUrl={`${SITE_URL}/photos`}
    ogImage={days[0]?.photos[0] ? `${SITE_URL}${days[0].photos[0].medium}` : undefined}
    feedUrl="/photos/feed.xml"
  >
    <section class="page-header">
      <h1>photos</h1>
      <p> Photo feed:  
      <a href="/photos/feed.xml" class="feed-link" aria-label="Photos Atom feed">link</a></p>
    </section>

    {days.length === 0 ? (
      <p class="empty">no photos yet</p>
    ) : (
      <div class="photo-roll">
        {days.map((day) => (
          <div key={day.date} id={day.date} class="roll-day">
            <div class="roll-day-header">
              <time dateTime={day.date}>{formatDate(day.date)}</time>
            </div>

            {day.photos.length > 0 && (
              <div class="roll-strip">
                {day.photos.map((photo) => (
                  <button
                    key={photo.base}
                    class="roll-photo"
                    data-medium={photo.medium}
                    data-alt={photo.base}
                    data-exif={photo.exif ? exifString(photo.exif) : ""}
                  >
                    <img
                      src={photo.thumb}
                      alt={photo.base}
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            )}

            {day.noteHtml && (
              <div
                class="roll-note"
                dangerouslySetInnerHTML={{ __html: day.noteHtml }}
              />
            )}
          </div>
        ))}
      </div>
    )}

    <div class="lightbox" id="lightbox" aria-hidden="true">
      <div class="lightbox-backdrop" id="lightbox-backdrop"></div>
      <div class="lightbox-content">
        <button class="lightbox-close" id="lightbox-close" aria-label="close">✕</button>
        <button class="lightbox-prev" id="lightbox-prev" aria-label="previous photo">‹</button>
        <button class="lightbox-next" id="lightbox-next" aria-label="next photo">›</button>
        <img class="lightbox-img" id="lightbox-img" src="" alt="" />
        <p class="lightbox-exif" id="lightbox-exif"></p>
      </div>
    </div>

    <script src="/static/js/lightbox.js"></script>
  </Layout>
);
