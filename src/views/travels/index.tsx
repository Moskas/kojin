import type { FC } from 'hono/jsx'
import { Layout } from '../layout'
import type { TravelCountry } from '../../content/travels'

const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000'

type Props = { countries: TravelCountry[] }

function countCities(countries: TravelCountry[]): number {
  return countries.reduce((acc, c) => acc + c.cities.length, 0)
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export const TravelsIndex: FC<Props> = ({ countries }) => {
  const cityCount = countCities(countries)

  return (
    <Layout
      title="travels"
      description="places i've been to."
      canonicalUrl={`${SITE_URL}/travels`}
    >
      <section class="page-header">
        <h1>travels</h1>
        <p class="page-description">places i've been to.</p>
      </section>

      <div class="travels-stats">
        <span>{countries.length}</span> {countries.length === 1 ? 'country' : 'countries'} &middot;{' '}
        <span>{cityCount}</span> {cityCount === 1 ? 'city' : 'cities'}
      </div>

      {countries.length === 0 ? (
        <p class="empty">no travels yet</p>
      ) : (
        <div class="travel-roll">
          {countries.map((country) => (
            <div key={country.country} class="travel-country">
              <div class="country-heading">
                <h2>{country.country}</h2>
              </div>

              {country.cities.map((cityData) => (
                <div key={cityData.city} class="travel-city-group">
                  {cityData.entries.map((entry) => (
                    <div key={entry.date} class="travel-city">
                      <div class="city-header">
                        <h3>{cityData.city}</h3>
                        <span class="city-year">{formatDate(entry.date)}</span>
                      </div>

                      {entry.description && (
                        <p class="city-note">{entry.description}</p>
                      )}

                      {entry.photos.length > 0 && (
                        <div class="travel-preview-strip">
                          {entry.photos.map((photo, i) => (
                            <button
                              key={photo.base}
                              class="roll-photo"
                              aria-label={`Photo ${i + 1}`}
                              data-medium={photo.medium}
                              data-alt={`${cityData.city} ${entry.date}`}
                              data-exif=""
                            >
                              <img
                                src={photo.thumb}
                                alt={`${cityData.city}`}
                                loading="lazy"
                                decoding="async"
                              />
                            </button>
                          ))}
                        </div>
                      )}

                      <a
                        href={`/travels/${entry.country}/${cityData.city}/${entry.date}`}
                        class="city-post-link"
                      >
                        full post
                      </a>
                    </div>
                  ))}
                </div>
              ))}
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
  )
}
