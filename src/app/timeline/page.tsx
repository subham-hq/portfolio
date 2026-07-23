import type { Metadata } from "next";
import { FadeIn } from "@/components/motion";
import { PageHeader, Section, TrackDot } from "@/components/primitives";
import { credentials, timeline } from "@/content/records";
import { formatMonth, formatRange } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Timeline",
  description:
    "Every dated event in one column — study, work, projects and certifications for " +
    "Subham Bhattacharya, newest first.",
  alternates: { canonical: "/timeline" },
};

type Row = {
  id: string;
  when: string;
  sort: string;
  title: string;
  org: string;
  track: "systems" | "operations";
};

/** One merged, sorted column. The experience page separates the two threads for
 *  readability; this page deliberately does not, so the density of the last two
 *  years is visible at a glance. */
export default function TimelinePage() {
  const rows: Row[] = [
    ...timeline.map((e) => ({
      id: e.id,
      when: formatRange(e.start, e.end),
      sort: e.start,
      title: e.title,
      org: e.org,
      track: e.track,
    })),
    ...credentials.map((c) => ({
      id: c.url,
      when: formatMonth(c.issued),
      sort: c.issued,
      title: c.title,
      org: c.issuer,
      track: "systems" as const,
    })),
  ].sort((a, b) => b.sort.localeCompare(a.sort));

  return (
    <div className="shell">
      <PageHeader
        eyebrow="Timeline"
        title="Everything, dated."
        lede={
          "Study, work, projects and certifications merged into a single column, newest " +
          "first. The experience page separates the two tracks; this one deliberately " +
          "does not."
        }
      />

      <Section title="All events" aside={`${rows.length} entries`}>
        <ol className="border-b border-rule">
          {rows.map((row, i) => (
            <li key={`${row.id}-${i}`}>
              <FadeIn delay={Math.min(i, 8) * 0.03}>
                <div className="grid gap-2 border-t border-rule py-5 md:grid-cols-[minmax(10rem,15vw)_1fr] md:gap-12">
                  <p className="label pt-1">{row.when}</p>
                  <div className="flex gap-4">
                    <TrackDot track={row.track} />
                    <div>
                      <p className="text-body">{row.title}</p>
                      <p className="mono mt-0.5 text-label text-fg-faint">{row.org}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </li>
          ))}
        </ol>
      </Section>
    </div>
  );
}
