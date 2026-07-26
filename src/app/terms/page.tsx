import type { Metadata } from "next";
import { PageHeader, Section, SpecRow } from "@/components/primitives";
import { emails, person } from "@/content/site";

export const metadata: Metadata = {
  title: "Terms",
  description: `Terms of use for ${person.name}'s personal site.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="shell">
      <PageHeader
        eyebrow="Terms"
        title="Terms of use."
        lede="A personal site, not a service. These terms are short because there is little to govern."
      />

      <Section title="Terms">
        <dl className="border-b border-rule">
          <SpecRow label="Purpose">
            This is a personal portfolio. It describes my work and background. It is not a
            product, and nothing here is an offer, a warranty, or professional advice.
          </SpecRow>
          <SpecRow label="Accuracy">
            I keep the content current and correct. If you find something wrong or out of
            date, tell me and I will fix it.
          </SpecRow>
          <SpecRow label="Source code">
            The code behind this site is MIT licensed and available on GitHub. Take it,
            learn from it, build on it. The licence covers the code and nothing else — not
            the writing, the images, or the audio.
          </SpecRow>
          <SpecRow label="Content and identity">
            The written content, résumé, photographs and personal likeness are not
            licensed for reuse. Please do not republish them as your own.
          </SpecRow>
          <SpecRow label="Audio">
            The ambient track is licensed to me from a third party. That licence does not
            let me pass it on, so it is excluded from the MIT grant above. If you are
            reading the repository, replace the file rather than reusing it.
          </SpecRow>
          <SpecRow label="Booking and messages">
            Scheduling runs on Cal.com and is subject to their terms. Booking a call or
            sending a message starts a conversation and nothing more — neither of us is
            committed to anything, and either can cancel.
          </SpecRow>
          <SpecRow label="External links">
            Links to GitHub, certificate issuers and other sites are provided for
            verification. I do not control what those sites publish.
          </SpecRow>
          <SpecRow label="Availability">
            The site may be offline for maintenance or deployment. There is no uptime
            commitment.
          </SpecRow>
          <SpecRow label="Questions">
            <a href={`mailto:${emails.legal}`} className="link-underline">
              {emails.legal}
            </a>
          </SpecRow>
        </dl>
      </Section>
    </div>
  );
}
