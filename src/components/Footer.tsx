import Link from "next/link";
import { LocalClock } from "./LocalClock";

import { bio, footerNav, legalNav, links, person } from "@/content/site";

const social = [
  { href: links.github, label: "GitHub" },
  { href: links.linkedin, label: "LinkedIn" },
  { href: links.x, label: "X" },
  { href: links.youtube, label: "YouTube" },
  { href: links.discord, label: "Discord" },
] as const;

export function Footer() {
  return (
    <footer className="no-print border-t border-rule-strong">
      <div className="shell py-16">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_2.4fr]">
          <div>
            <p className="font-display text-h3 max-w-[18ch]">{bio.oneLiner}</p>
            <p className="label mt-6">
              {person.location} · {person.coords}
            </p>
            <p className="label mt-1 flex items-center gap-2">
              <LocalClock />
              <span aria-hidden="true">·</span>
              <span>{person.utcOffset}</span>
            </p>

            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
              {social.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer noopener me"
                    className="tap-area link-underline inline-block py-1 text-body text-fg-muted hover:text-fg"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Footer" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(footerNav).map(([group, items]) => (
              <div key={group}>
                <p className="label mb-4">{group}</p>
                <ul className="space-y-0.5">
                  {items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="tap-area link-underline inline-block py-1 text-body text-fg-muted hover:text-fg"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-rule pt-6">
          <p className="label">
            © {new Date().getFullYear()} {person.name}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="tap-area inline-block py-1 label hover:text-fg"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="label">Archivo · Instrument Sans · IBM Plex Mono</p>
        </div>
      </div>
    </footer>
  );
}
