import type { Metadata } from "next";
import { FadeIn } from "@/components/motion";

import { PageHeader, Section, Tag, TrackDot } from "@/components/primitives";
import { roadmap, timeline } from "@/content/records";
import { durationLabel, formatRange } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Timeline of Subham Bhattacharya — engineering study, backend projects, and four " +
    "years running manufacturing operations in West Bengal.",
  alternates: { canonical: "/experience" },
};

export default function ExperiencePage() {
  return (
    <div className="shell">
      <PageHeader
        eyebrow="Experience"
        title="Two tracks, one direction."
        lede={
          "Engineering study and the manufacturing business ran in parallel rather than " +
          "in sequence — teal marks the engineering track, ochre the operational one. " +
          "The engineering track is where the next decade goes."
        }
      />

      <div className="flex flex-wrap gap-6 border-b border-rule pb-6">
        <span className="label flex items-center gap-2">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-signal" /> Systems
        </span>
        <span className="label flex items-center gap-2">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-ledger" />{" "}
          Operations
        </span>
      </div>

      <Section title="Timeline">
        <ol className="border-b border-rule">
          {timeline.map((entry, i) => (
            <li key={entry.id}>
              <FadeIn delay={(i * 55) / 1000}>
                <article className="grid gap-4 border-t border-rule py-8 md:grid-cols-[minmax(9rem,14vw)_1fr] md:gap-12">
                  <div>
                    <p className="label">{formatRange(entry.start, entry.end)}</p>
                    <p className="label mt-1 !text-fg-faint">
                      {durationLabel(entry.start, entry.end)}
                    </p>
                  </div>
                  <div className="flex min-w-0 gap-4">
                    <TrackDot track={entry.track} />
                    <div className="min-w-0">
                      <h3 className="font-display text-h3">{entry.title}</h3>
                      <p className="mono mt-1 text-label text-fg-muted">
                        {entry.org}
                        {entry.location ? ` · ${entry.location}` : ""}
                      </p>
                      <ul className="prose-measure mt-4 space-y-2">
                        {entry.points.map((point) => (
                          <li key={point} className="text-body text-fg-muted">
                            {point}
                          </li>
                        ))}
                      </ul>
                      {entry.tags?.length ? (
                        <div className="mt-5 flex flex-wrap gap-2">
                          {entry.tags.map((t) => (
                            <Tag key={t}>{t}</Tag>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              </FadeIn>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Where this goes">
        <ol className="border-b border-rule">
          {roadmap.map((stage) => (
            <li
              key={stage.phase}
              className="grid gap-4 border-t border-rule py-8 md:grid-cols-[minmax(9rem,14vw)_1fr] md:gap-12"
            >
              <div className="label pt-1">
                {stage.phase} ·{" "}
                <span className={stage.state === "current" ? "text-signal" : ""}>
                  {stage.state === "done"
                    ? "Complete"
                    : stage.state === "current"
                      ? "In progress"
                      : "Planned"}
                </span>
              </div>
              <div>
                <h3 className="font-display text-h3">{stage.title}</h3>
                <p className="prose-measure mt-3 text-body text-fg-muted">
                  {stage.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Section>
    </div>
  );
}
