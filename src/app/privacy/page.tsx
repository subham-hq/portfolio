import type { Metadata } from "next";
import { PageHeader, Section, SpecRow } from "@/components/primitives";
import { links, person } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${person.name}'s site handles visitor data. Short version: barely at all.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="shell">
      <PageHeader
        eyebrow="Privacy"
        title="What this site collects, in plain terms."
        lede="Short version: no cookies, no advertising, no cross-site tracking, and nothing sold."
      />

      <Section title="Summary">
        <dl className="border-b border-rule">
          <SpecRow label="Cookies">None. The site sets no cookies of any kind.</SpecRow>
          <SpecRow label="Analytics">
            Vercel Analytics and Speed Insights record aggregate page views and
            performance timings. They do not use cookies, do not build a profile, and do
            not follow you to other sites.
          </SpecRow>
          <SpecRow label="Theme preference">
            Stored in your browser&apos;s localStorage so the site remembers light or
            dark. It never leaves your device.
          </SpecRow>
          <SpecRow label="Contact form">
            Your name, email address and message are sent to my inbox through Resend, an
            email delivery provider. They are used to reply to you and nothing else.
          </SpecRow>
          <SpecRow label="Third parties">
            Repository data is fetched from GitHub&apos;s public API server-side, so your
            browser never contacts GitHub. The contribution graph is an image request to a
            third-party renderer.
          </SpecRow>
          <SpecRow label="Selling data">Never. There is nothing to sell.</SpecRow>
        </dl>
      </Section>

      <Section title="Your data">
        <div className="prose-measure text-lead text-fg-muted">
          <p>
            If you have written to me and want that message deleted, email{" "}
            <a href={links.email} className="link-underline">
              {person.email}
            </a>{" "}
            and I will delete it. No form, no process, no verification hoops.
          </p>
          <p>
            If this policy changes, the change will appear here. The site is open source,
            so the history is public.
          </p>
        </div>
      </Section>
    </div>
  );
}
