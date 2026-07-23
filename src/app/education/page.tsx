import type { Metadata } from "next";
import { FadeIn } from "@/components/motion";
import { PageHeader, Section, SpecRow, Tag } from "@/components/primitives";
import { credentials, timeline } from "@/content/records";
import { formatMonth, formatRange } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Education",
  description:
    "BSc Computer Science at BITS Pilani — computing systems and systems programming — " +
    "plus the self-directed study behind it.",
  alternates: { canonical: "/education" },
};

const focusAreas = [
  {
    title: "Systems architecture & optimisation",
    detail:
      "Operating system design, performance tuning, and the command-line tooling that " +
      "makes a system inspectable rather than opaque.",
  },
  {
    title: "Distributed systems & networking",
    detail:
      "Network programming end to end: client–server architecture and the TCP/IP " +
      "stack implemented rather than assumed.",
  },
  {
    title: "High-performance computation",
    detail:
      "Multi-core processing and GPGPU programming for workloads where the cost model " +
      "decides the design.",
  },
];

export default function EducationPage() {
  const formal = timeline.filter((e) => ["bits", "school"].includes(e.id));

  return (
    <div className="shell">
      <PageHeader
        eyebrow="Education"
        title="Fundamentals, formalised."
        lede={
          "A BSc in Computer Science at BITS Pilani, concentrated on computing systems " +
          "and systems programming — operating systems, networking, and the cost model " +
          "underneath everything else here."
        }
      />

      <Section title="Formal">
        <ol className="border-b border-rule">
          {formal.map((entry) => (
            <li
              key={entry.id}
              className="grid gap-4 border-t border-rule py-8 md:grid-cols-[minmax(9rem,14vw)_1fr] md:gap-12"
            >
              <p className="label">{formatRange(entry.start, entry.end)}</p>
              <div>
                <h3 className="font-display text-h3">{entry.title}</h3>
                <p className="mono mt-1 text-label text-fg-muted">{entry.org}</p>
                <ul className="prose-measure mt-4 space-y-2">
                  {entry.points.map((p) => (
                    <li key={p} className="text-body text-fg-muted">
                      {p}
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
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Concentration" aside="BITS Pilani · computing systems track">
        <ol className="grid gap-px bg-rule md:grid-cols-3">
          {focusAreas.map((area, i) => (
            <li key={area.title} className="surface p-6">
              <FadeIn delay={i * 0.07}>
                <h3 className="font-display text-h3">{area.title}</h3>
                <p className="mt-3 text-body text-fg-muted">{area.detail}</p>
              </FadeIn>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Alongside" aside="Verified coursework">
        <dl className="border-b border-rule">
          {credentials.map((c) => (
            <SpecRow key={c.url} label={formatMonth(c.issued)}>
              <a
                href={c.url}
                target="_blank"
                rel="noreferrer noopener"
                className="link-underline"
              >
                {c.title}
              </a>
              <span className="mono mt-1 block text-label text-fg-faint">
                {c.issuer}
                {c.grade ? ` · ${c.grade}` : ""}
              </span>
            </SpecRow>
          ))}
        </dl>
      </Section>
    </div>
  );
}
