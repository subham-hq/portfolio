import type { Metadata } from "next";
import { FadeIn } from "@/components/motion";

import { PageHeader, Section, Tag } from "@/components/primitives";
import { credentials } from "@/content/records";
import { formatMonth } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Credentials",
  description:
    "Verified certifications held by Subham Bhattacharya — Harvard CS50x, University of " +
    "Michigan Python specialisation, HackerRank.",
  alternates: { canonical: "/certifications" },
};

export default function CredentialsPage() {
  return (
    <div className="shell">
      <PageHeader
        eyebrow="Credentials"
        title="Coursework, with the receipts."
        lede={
          "Harvard, University of Michigan and HackerRank. Every entry links straight " +
          "to its issuing record, and the topics each one covered are listed alongside."
        }
      />

      <Section title="Certifications" aside={`${credentials.length} · all verifiable`}>
        <ol className="border-b border-rule">
          {credentials.map((c, i) => (
            <li key={c.url}>
              <FadeIn delay={(i * 55) / 1000}>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group grid gap-4 border-t border-rule py-8 md:grid-cols-[minmax(9rem,14vw)_1fr] md:gap-12"
                >
                  <div>
                    <p className="label">{formatMonth(c.issued)}</p>
                    {c.grade ? (
                      <p className="mono mt-1 text-micro text-signal">{c.grade}</p>
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-h3 transition-colors group-hover:text-signal">
                      {c.title}
                      <span aria-hidden="true" className="ml-2 text-fg-faint">
                        ↗
                      </span>
                    </h3>
                    <p className="mono mt-1 text-label text-fg-muted">{c.issuer}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {c.covers.map((s) => (
                        <Tag key={s}>{s}</Tag>
                      ))}
                    </div>
                  </div>
                </a>
              </FadeIn>
            </li>
          ))}
        </ol>
      </Section>
    </div>
  );
}
