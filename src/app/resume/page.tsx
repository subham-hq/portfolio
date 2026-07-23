import type { Metadata } from "next";
import { Button, PageHeader, Section, SpecRow, Tag } from "@/components/primitives";
import { credentials, languages, skills, timeline } from "@/content/records";
import { bio, links, person } from "@/content/site";
import { formatMonth, formatRange } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Résumé",
  description: `Résumé of ${person.name} — ${bio.oneLiner}`,
  alternates: { canonical: "/resume" },
};

/**
 * A readable résumé at a stable URL, plus the PDF for anyone who needs to file
 * one. The page is print-stylesheet aware, so ⌘P produces something usable even
 * if the PDF is out of date.
 */
export default function ResumePage() {
  const core = skills.flatMap((g) =>
    g.items.filter((i) => i.depth === "core").map((i) => i.name),
  );

  return (
    <div className="shell">
      <PageHeader eyebrow="Résumé" title={person.name} lede={bio.short} />

      <div className="no-print flex flex-wrap gap-3 pb-4">
        <Button href={links.resume} external>
          Download PDF
        </Button>
        <Button href={links.linkedin} variant="outline" external>
          LinkedIn
        </Button>
        <Button href="/contact" variant="outline">
          Contact
        </Button>
      </div>

      <Section title="Details">
        <dl className="border-b border-rule">
          <SpecRow label="Role">
            {person.role} · building toward {person.target}
          </SpecRow>
          <SpecRow label="Location">
            {person.location} · {person.utcOffset}
          </SpecRow>
          <SpecRow label="Email">
            <a href={links.email} className="link-underline">
              {person.email}
            </a>
          </SpecRow>
          <SpecRow label="Core skills">{core.join(" · ")}</SpecRow>
          <SpecRow label="Languages">
            {languages.map((l) => `${l.name} (${l.level.toLowerCase()})`).join(" · ")}
          </SpecRow>
        </dl>
      </Section>

      <Section title="Experience & education">
        <ol className="border-b border-rule">
          {timeline.map((entry) => (
            <li
              key={entry.id}
              className="grid gap-3 border-t border-rule py-7 md:grid-cols-[minmax(9rem,14vw)_1fr] md:gap-12"
            >
              <p className="label">{formatRange(entry.start, entry.end)}</p>
              <div>
                <h3 className="font-display text-h3">{entry.title}</h3>
                <p className="mono mt-1 text-label text-fg-muted">{entry.org}</p>
                <ul className="prose-measure mt-3 space-y-1.5">
                  {entry.points.map((point) => (
                    <li key={point} className="text-body text-fg-muted">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Certifications">
        <ul className="border-b border-rule">
          {credentials.map((c) => (
            <li
              key={c.url}
              className="grid gap-2 border-t border-rule py-5 md:grid-cols-[minmax(9rem,14vw)_1fr] md:gap-12"
            >
              <p className="label">{formatMonth(c.issued)}</p>
              <p className="text-body">
                {c.title}
                <span className="text-fg-muted"> — {c.issuer}</span>
                {c.grade ? <span className="mono text-signal"> · {c.grade}</span> : null}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Skills">
        <div className="space-y-6">
          {skills.map((group) => (
            <div key={group.group}>
              <p className="label mb-3">{group.group}</p>
              <div className="flex flex-wrap gap-2">
                {group.items.map((i) => (
                  <Tag key={i.name}>{i.name}</Tag>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
