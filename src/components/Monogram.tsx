"use client";

import Link from "next/link";
import { person } from "@/content/site";
import { cx } from "@/lib/utils";

/**
 * WORDMARK
 *
 * The name, set in the display face at 600 with tight negative tracking —
 * not the mono UI face, and not a monogram. A monogram earns its place when a
 * brand is known well enough to be recognised by initials; here the name
 * itself is the asset, so it gets the weight.
 *
 * Below 400px the surname drops. "Subham B." keeps the header row from
 * colliding with the clock, theme toggle and menu control on a small phone.
 */
export function Wordmark({ className }: { className?: string }) {
  const [first, ...rest] = person.name.split(" ");

  return (
    <Link
      href="/"
      aria-label={`${person.name} — home`}
      className={cx(
        "wordmark group -ml-1 flex min-h-11 items-center gap-2.5 px-1",
        className,
      )}
    >
      <span className="font-display text-[1.05rem] leading-none font-semibold tracking-[-0.035em] whitespace-nowrap transition-colors group-hover:text-signal">
        {first}
        <span className="hidden min-[400px]:inline"> {rest.join(" ")}</span>
        <span className="min-[400px]:hidden"> B.</span>
      </span>
    </Link>
  );
}
