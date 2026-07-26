import type { Metadata } from "next";
import { PageHeader, Section, SpecRow } from "@/components/primitives";
import { emails, person } from "@/content/site";

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
            None. No page views, no sessions, no performance beacons, no fingerprinting. I
            do not know that you were here unless you write to me.
          </SpecRow>
          <SpecRow label="Theme preference">
            Stored in your browser&apos;s localStorage so the site remembers light or
            dark. It never leaves your device.
          </SpecRow>
          <SpecRow label="Contact form">
            Your name, email address and message are sent to my inbox through Resend, an
            email delivery provider. They are used to reply to you and nothing else.
          </SpecRow>
          <SpecRow label="Booking a call">
            The scheduling page is Cal.com, not this site. If you book, you give them your
            name, email address and timezone so they can send the invite. I see what you
            put on that form and nothing else.
          </SpecRow>
          <SpecRow label="How long I keep things">
            Messages stay in my inbox while the conversation is live and are deleted when
            it is not. Bookings live in my calendar. Ask me to remove either and I will,
            same day.
          </SpecRow>
          <SpecRow label="Hosting">
            Cloudflare Pages serves the site and logs each request — IP address,
            timestamp, user agent — which is what any web server does in order to answer
            you at all. In their dashboard I see aggregate totals, never individual
            visitors.
          </SpecRow>
          <SpecRow label="Third parties">
            Three, and only when you choose them: Cal.com if you book a call, Resend if
            you send a message, Cloudflare because it serves the page. Repository and
            contribution data is fetched from GitHub at build time, so your browser never
            contacts GitHub. Fonts, images and audio are served from this domain.
          </SpecRow>
          <SpecRow label="Selling data">Never. There is nothing to sell.</SpecRow>
        </dl>
      </Section>

      <Section title="Your data">
        <div className="prose-measure text-lead text-fg-muted">
          <p>
            If you have written to me and want that message deleted, email{" "}
            <a href={`mailto:${emails.privacy}`} className="link-underline">
              {emails.privacy}
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
