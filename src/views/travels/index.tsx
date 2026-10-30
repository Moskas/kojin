import type { FC } from 'hono/jsx'
import { Layout } from '../layout'
import type { TravelCountry } from '../../content/travels'
import { joinNodes } from '../text-sep'

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
    <Layout title="travels" description="places i've been to." canonicalUrl={`${SITE_URL}/travels`}>
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

              {country.noteHtml && (
                <div class="prose" dangerouslySetInnerHTML={{ __html: country.noteHtml }} />
              )}

              {country.cities.map((cityData) => (
                <div key={cityData.city} class="travel-city-group">
                  <div class="city-header">
                    <h3>{cityData.city}</h3>
                  </div>

                  {cityData.noteHtml && (
                    <div class="prose" dangerouslySetInnerHTML={{ __html: cityData.noteHtml }} />
                  )}

                  {cityData.entries.map((entry) => (
                    <div key={entry.date} class="travel-city">
                      <div class="city-header">
                        <span class="city-year">{formatDate(entry.date)}</span>
                      </div>

                      {entry.description && <p class="city-note">{entry.description}</p>}

                      {entry.photos.length > 0 && (
                        <div class="travel-preview-strip">
                          {joinNodes(
                            entry.photos.map((photo, i) => (
                              <a
                                key={photo.base}
                                href={photo.medium}
                                class="roll-photo"
                                data-alt={`${cityData.city} ${entry.date}`}
                                data-exif=""
                              >
                                <img
                                  src={photo.thumb}
                                  alt={`${cityData.city} photo ${i + 1} of ${entry.photos.length}`}
                                  loading="lazy"
                                  decoding="async"
                                />
                              </a>
                            )),
                            ' | '
                          )}
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

      <script src="/static/js/lightbox.js"></script>
    </Layout>
  )
}
