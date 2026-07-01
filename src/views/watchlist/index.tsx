import type { FC } from "hono/jsx";
import { Layout } from "../layout";
import type {
  WatchEntry,
  WatchSection,
  WatchQuery,
  WatchStatus,
} from "../../content/watchlist";

type Props = {
  sections: WatchSection[];
  query: WatchQuery;
};

const STATUS_LABEL: Record<WatchStatus | "all", string> = {
  all: "all",
  watching: "watching",
  finished: "finished",
  plan: "plan to watch",
  dropped: "dropped",
};

const FILTERS: Array<WatchStatus | "all"> = [
  "all",
  "watching",
  "finished",
  "plan",
  "dropped",
];

function buildUrl(base: WatchQuery, overrides: Partial<WatchQuery>): string {
  const p = { ...base, ...overrides };
  const params = new URLSearchParams();
  if (p.filter !== "all") params.set("filter", p.filter);
  const qs = params.toString();
  return `/watchlist${qs ? "?" + qs : ""}`;
}

const EntryRow: FC<{ entry: WatchEntry }> = ({ entry }) => {
  const credit = entry.director ?? entry.creator;
  return (
    <div id={entry.id} class="watchlist-row">
      <div class="watchlist-cover-col">
        <div class="watchlist-cover">
          {entry.cover ? (
            <img
              src={entry.cover}
              alt={`${entry.title} cover`}
              loading="lazy"
            />
          ) : (
            <div class="watchlist-cover-ph">{entry.title}</div>
          )}
        </div>
        <div class="watchlist-stats">
          <span class="watchlist-stat">
            <span class="watchlist-stat-key">status</span>
            <span class={`watchlist-status watchlist-status--${entry.status}`}>
              {STATUS_LABEL[entry.status]}
            </span>
          </span>
          <span class="watchlist-stat">
            <span class="watchlist-stat-key">rating</span>
            <span>{entry.rating}/10</span>
          </span>
          {entry.year && (
            <span class="watchlist-stat">
              <span class="watchlist-stat-key">year</span>
              <span>{entry.year}</span>
            </span>
          )}
          {entry.seasons && (
            <span class="watchlist-stat">
              <span class="watchlist-stat-key">seasons</span>
              <span>{entry.seasons}</span>
            </span>
          )}
        </div>
      </div>
      <div class="watchlist-entry">
        <div class="watchlist-titleline">
          <h3 class="watchlist-entry-title">
            {entry.link ? (
              <a href={entry.link} target="_blank" rel="noopener noreferrer">
                {entry.title}
              </a>
            ) : (
              entry.title
            )}
          </h3>
          {credit && <span class="watchlist-credit">{credit}</span>}
        </div>
        <div
          class="watchlist-writeup"
          dangerouslySetInnerHTML={{ __html: entry.writeupHtml }}
        />
      </div>
    </div>
  );
};

const SectionBlock: FC<{ section: WatchSection }> = ({ section }) => (
  <section id={section.id} class="watchlist-section">
    <div class="watchlist-section-head">
      <span class="hash">#</span>
      <h2>{section.title}</h2>
      <span class="watchlist-count">
        {section.entries.length}{" "}
        {section.entries.length === 1 ? "entry" : "entries"}
      </span>
    </div>
    {section.entries.length === 0 ? (
      <p class="watchlist-empty">nothing here for this filter</p>
    ) : (
      section.entries.map((entry) => <EntryRow key={entry.id} entry={entry} />)
    )}
  </section>
);

export const WatchlistPage: FC<Props> = ({ sections, query }) => {
  const total = sections.reduce((n, s) => n + s.entries.length, 0);

  return (
    <Layout title="Watchlist">
      <section class="page-header">
        <h1>watchlist</h1>
        <p class="page-description">
          movies and series I've watched or am watching.
        </p>
      </section>

      <div class="watchlist-toolbar">
        <div class="watchlist-ctl">
          <span class="watchlist-lab">filter</span>
          {FILTERS.map((f) => (
            <a
              key={f}
              href={buildUrl(query, { filter: f })}
              class={`watchlist-chip${query.filter === f ? " watchlist-chip--active" : ""}`}
            >
              {STATUS_LABEL[f]}
            </a>
          ))}
        </div>
      </div>

      {total === 0 ? (
        <p class="watchlist-empty">nothing here for this filter</p>
      ) : (
        <>
          <details class="watchlist-toc">
            <summary class="watchlist-toc-toggle">contents</summary>
            <nav class="uses-toc" aria-label="watchlist contents">
              {sections
                .filter((s) => s.entries.length > 0)
                .map((section) => (
                  <div key={section.id} class="uses-toc-section">
                    <a class="uses-toc-label" href={`#${section.id}`}>
                      {section.title}
                    </a>
                    {section.entries.map((entry) => (
                      <a key={entry.id} href={`#${entry.id}`}>
                        {entry.title}
                      </a>
                    ))}
                  </div>
                ))}
            </nav>
          </details>
          {sections.map((section) => (
            <SectionBlock key={section.id} section={section} />
          ))}
        </>
      )}
    </Layout>
  );
};
