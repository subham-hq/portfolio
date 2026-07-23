import type { Metadata } from "next";
import { FadeIn } from "@/components/motion";

import { PageHeader, Section, SpecRow } from "@/components/primitives";
import { languages, skills, type Depth } from "@/content/records";
import { cx } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Stack",
  description:
    "Languages, backend tooling and computer science fundamentals used by Subham " +
    "Bhattacharya, with declared depth rather than progress bars.",
  alternates: { canonical: "/tech-stack" },
};

const DEPTH_LABEL: Record<Depth, string> = {
  core: "Core",
  proficient: "Proficient",
  working: "Working",
};

const DEPTH_STYLE: Record<Depth, string> = {
  core: "text-signal border-signal/40",
  proficient: "text-fg-muted border-rule-strong",
  working: "text-fg-faint border-rule",
};

export default function StackPage() {
  return (
    <div className="shell">
      <PageHeader
        eyebrow="Stack"
        title="Declared depth, not percentages."
        lede={
          "Three levels, each with a precise meaning. Core is where I can defend the " +
          "design decisions; proficient is where I can build unaided and know the gaps; " +
          "working is where I can read it and ship with the documentation open."
        }
      />

      <Section title="The levels">
        <dl className="border-b border-rule">
          <SpecRow label="Core">
            I can defend design decisions in it under questioning.
          </SpecRow>
          <SpecRow label="Proficient">
            I can build unaided, and I know where I am weak.
          </SpecRow>
          <SpecRow label="Working">
            I can read it and get things done with the documentation open.
          </SpecRow>
        </dl>
      </Section>

      {skills.map((group, gi) => (
        <Section key={group.group} title={group.group} aside={group.note}>
          <ul className="grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((item, i) => (
              <li key={item.name} className="surface">
                <FadeIn delay={((gi * 3 + i) * 25) / 1000}>
                  <div className="flex items-center justify-between gap-4 p-5">
                    <span className="text-body">{item.name}</span>
                    <span
                      className={cx(
                        "mono shrink-0 rounded-xs border px-2 py-0.5 text-micro uppercase tracking-[0.08em]",
                        DEPTH_STYLE[item.depth],
                      )}
                    >
                      {DEPTH_LABEL[item.depth]}
                    </span>
                  </div>
                </FadeIn>
              </li>
            ))}
          </ul>
        </Section>
      ))}

      <Section title="Languages (spoken)">
        <dl className="border-b border-rule">
          {languages.map((l) => (
            <SpecRow key={l.name} label={l.name}>
              {l.level}
            </SpecRow>
          ))}
        </dl>
      </Section>
    </div>
  );
}
