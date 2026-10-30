import type { FC } from "hono/jsx";
import { Layout } from "../layout";
import { NOTE_STATUS_LABEL } from "../../content/garden";
import type { Note, BacklinkEntry } from "../../content/garden";

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

type NavEntry = { slug: string; title: string };

type Props = {
    note: Note;
    backlinks: BacklinkEntry[];
    prev?: NavEntry;
    next?: NavEntry;
};

const fmt = (d: string) => d.replace(/-/g, ".");

export const GardenNote: FC<Props> = ({ note, backlinks, prev, next }) => {
    const { frontmatter } = note;
    const title = frontmatter.title ?? note.slug;

    return (
        <Layout
            title={title}
            description={note.excerpt || undefined}
            ogType="article"
            canonicalUrl={`${SITE_URL}/garden/${note.slug}`}
        >
            <article class="garden-note">
                <nav class="garden-crumb">
                    <a href="/garden">← notes</a>
                </nav>

                <header class="garden-note-head">
                    <h1 class="garden-note-title">
                        <span class="hash">#</span>
                        {title}
                    </h1>
                    <div class="garden-note-meta">
                        <span>
                            status{" "}
                            <span
                                class={`garden-status garden-status--${note.status}`}
                            >
                                [{NOTE_STATUS_LABEL[note.status]}]
                            </span>
                        </span>
                        {frontmatter.created && (
                            <span>
                                created{" "}
                                <time datetime={frontmatter.created}>
                                    {fmt(frontmatter.created)}
                                </time>
                            </span>
                        )}
                        {frontmatter.updated && (
                            <span>
                                updated{" "}
                                <time datetime={frontmatter.updated}>
                                    {fmt(frontmatter.updated)}
                                </time>
                            </span>
                        )}
                        <span>{note.readingMinutes} min read</span>
                    </div>
                    {frontmatter.tags && (
                        <div class="tags">
                            {frontmatter.tags.map((tag) => (
                                <a
                                    key={tag}
                                    href={`/garden?tag=${encodeURIComponent(tag)}`}
                                    class="tag"
                                >
                                    {tag}
                                </a>
                            ))}
                        </div>
                    )}
                </header>

                <div
                    class="prose"
                    dangerouslySetInnerHTML={{ __html: note.html }}
                />

                {backlinks.length > 0 && (
                    <section class="garden-backlinks">
                        <h2>
                            linked from{" "}
                            <span class="garden-backlinks-count">
                                ({backlinks.length})
                            </span>
                        </h2>
                        <ul>
                            {backlinks.map((link) => (
                                <li key={link.slug}>
                                    <a href={`/garden/${link.slug}`}>
                                        {link.title}
                                    </a>
                                    {link.context && (
                                        <p class="garden-backlink-ctx">
                                            {link.context.before}
                                            <mark>{link.context.link}</mark>
                                            {link.context.after}
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {(prev || next) && (
                    <nav class="post-nav">
                        {prev && (
                            <a
                                href={`/garden/${prev.slug}`}
                                class="post-nav-prev"
                            >
                                ← {prev.title}
                            </a>
                        )}
                        {next && (
                            <a
                                href={`/garden/${next.slug}`}
                                class="post-nav-next"
                            >
                                {next.title} →
                            </a>
                        )}
                    </nav>
                )}
            </article>
        </Layout>
    );
};
