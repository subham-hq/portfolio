import type { Metadata } from "next";
import Image from "next/image";
import { FadeIn } from "@/components/motion";

import { Button, PageHeader, Prose, Section, SpecRow } from "@/components/primitives";
import { languages } from "@/content/records";
import { bio, links, person } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description: bio.short,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="shell">
      <div className="grid items-center gap-10 lg:grid-cols-[1.5fr_minmax(15rem,20rem)] lg:gap-14">
        <PageHeader
          eyebrow="About"
          title="I design for the failure case before the happy path."
        />

        <FadeIn
          delay={0.15}
          className="order-first mx-auto w-52 max-w-full sm:w-64 lg:order-none lg:w-full"
        >
          <figure className="portrait-wrap m-0">
            <div className="portrait-frame">
              <Image
                src="/portrait.png"
                alt={person.name}
                width={900}
                height={900}
                sizes="(min-width: 1024px) 20rem, 16rem"
                priority
                className="portrait-img"
              />
            </div>
          </figure>
        </FadeIn>
      </div>

      <Section title="Long form">
        <FadeIn>
          <Prose paragraphs={bio.long} />
        </FadeIn>
      </Section>

      <Section title="Facts">
        <dl className="border-b border-rule">
          <SpecRow label="Name">{person.name}</SpecRow>
          <SpecRow label="Role">
            {person.role}, building toward {person.target}
          </SpecRow>
          <SpecRow label="Location">
            {person.location} · {person.utcOffset}
          </SpecRow>
          <SpecRow label="Studying">
            BSc Computer Science, BITS Pilani (2026–2030)
          </SpecRow>
          <SpecRow label="Languages">
            {languages.map((l) => `${l.name} (${l.level.toLowerCase()})`).join(" · ")}
          </SpecRow>
          <SpecRow label="Email">
            <a href={links.email} className="link-underline">
              {person.email}
            </a>
          </SpecRow>
        </dl>
      </Section>

      <Section title="How I work">
        <div className="grid gap-px bg-rule md:grid-cols-3">
          {[
            {
              title: "Failure modes first",
              body:
                "Before the happy path, I want to know what breaks it, what happens when " +
                "it breaks, and whether it breaks loudly. A process that fails quietly is " +
                "the expensive kind.",
            },
            {
              title: "Depth over breadth",
              body:
                "One stack understood well enough to defend every trade-off out loud, " +
                "rather than a list of frameworks touched once. Breadth comes after, and " +
                "it comes faster from a real foundation.",
            },
            {
              title: "Written to be read",
              body:
                "Code and documentation both have a second reader — usually a later " +
                "version of me. Clean repositories and honest READMEs are part of the " +
                "work, not paperwork after it.",
            },
          ].map((item, i) => (
            <div key={item.title} className="bg-bg p-6">
              <FadeIn delay={(i * 70) / 1000}>
                <h3 className="font-display text-h3">{item.title}</h3>
                <p className="mt-3 text-body text-fg-muted">{item.body}</p>
              </FadeIn>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Short versions">
        <dl className="border-b border-rule">
          <SpecRow label="One line">{bio.oneLiner}</SpecRow>
          <SpecRow label="Short bio">{bio.short}</SpecRow>
          <SpecRow label="Elevator">{bio.elevator}</SpecRow>
        </dl>
      </Section>

      <Section title="Next">
        <div className="flex flex-wrap gap-3">
          <Button href="/projects">See the work</Button>
          <Button href="/experience" variant="outline">
            Timeline
          </Button>
          <Button href={links.resume} variant="outline" external>
            Résumé (PDF)
          </Button>
        </div>
      </Section>
    </div>
  );
}
