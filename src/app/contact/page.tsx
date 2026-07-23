import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Faq } from "@/components/Faq";
import { LocalClock } from "@/components/LocalClock";
import { PageHeader, Section, SpecRow } from "@/components/primitives";
import { links, person } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Reach Subham Bhattacharya at ${person.email}, or on GitHub, LinkedIn and X.`,
  alternates: { canonical: "/contact" },
};

const channels = [
  {
    label: "Email",
    value: person.email,
    href: links.email,
    note: "Best channel. I reply within a day.",
  },
  {
    label: "GitHub",
    value: "subham-hq",
    href: links.github,
    note: "The code. Start here if you are technical.",
  },
  {
    label: "LinkedIn",
    value: "in/subham-bh",
    href: links.linkedin,
    note: "Roles and introductions.",
  },
  {
    label: "X",
    value: "@subhamhq",
    href: links.x,
    note: "Occasional notes on what I am building.",
  },
  {
    label: "YouTube",
    value: "@subham.bhattacharya",
    href: links.youtube,
    note: "Project walkthroughs.",
  },
  {
    label: "Discord",
    value: "Direct message",
    href: links.discord,
    note: "For anything synchronous.",
  },
];

export default function ContactPage() {
  return (
    <div className="shell">
      <PageHeader
        eyebrow="Contact"
        title="Send a message, or pick a channel."
        lede={
          "The form reaches my inbox directly and replies go back to the address you " +
          "give. Every other channel is listed below if you would rather use your own " +
          "client."
        }
      />

      <Section title="Message">
        <ContactForm />
      </Section>

      <Section title="Channels">
        <ul className="border-b border-rule">
          {channels.map((c) => (
            <li key={c.label}>
              <a
                href={c.href}
                target={c.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noreferrer noopener"
                className="group grid gap-2 border-t border-rule py-6 md:grid-cols-[minmax(9rem,14vw)_1fr_auto] md:items-baseline md:gap-12"
              >
                <span className="label">{c.label}</span>
                <span className="mono text-body transition-colors group-hover:text-signal">
                  {c.value}
                  <span aria-hidden="true" className="ml-2 text-fg-faint">
                    ↗
                  </span>
                </span>
                <span className="text-body text-fg-muted">{c.note}</span>
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Before you write">
        <Faq />
      </Section>

      <Section title="Availability">
        <dl className="border-b border-rule">
          <SpecRow label="Status">
            <span className="text-signal">
              Open to backend / platform roles — remote or relocation
            </span>
          </SpecRow>
          <SpecRow label="Location">
            {person.location} · {person.utcOffset}
          </SpecRow>
          <SpecRow label="Local time">
            <LocalClock />
          </SpecRow>
          <SpecRow label="Working hours">
            09:00–19:00 IST. I overlap comfortably with EMEA, partially with US Eastern.
          </SpecRow>
          <SpecRow label="Résumé">
            <a href={links.resume} className="link-underline" download>
              Download PDF
            </a>
          </SpecRow>
        </dl>
      </Section>
    </div>
  );
}
