import type { Metadata } from "next";
import { Button, PageHeader, Section } from "@/components/primitives";
import { notes } from "@/content/posts";
import { links } from "@/content/site";

export const metadata: Metadata = {
  title: "Notes",
  description:
    "Short technical notes — things learned while building, too small for a post and " +
    "too useful to lose.",
  alternates: { canonical: "/writing" },
};

export default function WritingPage() {
  return (
    <div className="shell">
      <PageHeader
        eyebrow="Notes"
        title="Notes from the build."
        lede={
          "Things learned mid-build: a failure mode I did not expect, a decision I had " +
          "to reverse, a line of documentation that turned out to matter."
        }
      />

      <Section title="Notes" aside={notes.length ? `${notes.length}` : "None yet"}>
        {notes.length === 0 ? (
          <div className="border border-dashed border-rule-strong p-8">
            <p className="font-display text-h3">Nothing here yet</p>
            <p className="prose-measure mt-3 text-fg-muted">
              Notes get published as they accumulate. Until then, the repository READMEs
              carry most of this thinking, and the case studies carry the rest.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href={links.github} variant="outline" external>
                Read the repositories
              </Button>
              <Button href="/blog" variant="outline">
                Blog
              </Button>
            </div>
          </div>
        ) : (
          <ul className="border-b border-rule">
            {notes.map((note) => (
              <li
                key={note.slug}
                className="grid gap-3 border-t border-rule py-7 md:grid-cols-[minmax(9rem,14vw)_1fr] md:gap-12"
              >
                <p className="label pt-1">{note.published}</p>
                <div>
                  <h2 className="font-display text-h3">{note.title}</h2>
                  <p className="prose-measure mt-2 text-fg-muted">{note.summary}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
