import { links } from "@/content/site";
import { cx } from "@/lib/utils";

/**
 * BOOK A CALL
 *
 * Its own component rather than a `<Button href={links.cal}>` for one reason:
 * this is the only action on the site that converts, and it should be visually
 * identical in all six places it appears — header, mobile menu, hero, index
 * contact block, contact page, résumé. A recognisable object beats six buttons
 * that happen to share a colour.
 *
 * It carries the signal hue and a live dot rather than the neutral treatment
 * used by every other button, so it reads as the one live thing on the page
 * without shouting. The dot is the same device as the "available for work"
 * indicator in the hero — deliberately, since it means the same thing.
 *
 * The `animate-pulse` on the dot is disabled automatically: globals.css
 * neutralises every animation under `prefers-reduced-motion`, so there is no
 * per-component check to keep in sync.
 *
 * Note on CSP: this is a plain navigation link, not a fetch or an embed, so
 * nothing in public/_headers needs to change. That stops being true the moment
 * you swap it for Cal's inline embed widget — that would need `script-src` and
 * `frame-src` entries for cal.com, and would silently render nothing without
 * them.
 */
export function BookCall({
  variant = "outline",
  size = "default",
  fullWidth,
  label = "Book a call",
  className,
}: {
  /** `solid` where booking is the primary action on the screen. */
  variant?: "solid" | "outline";
  /** `compact` fits the header row without crowding the controls beside it. */
  size?: "default" | "compact";
  /** Stacks full-width below 640px, then returns to intrinsic width. */
  fullWidth?: boolean;
  label?: string;
  className?: string;
}) {
  const base =
    "mono group inline-flex items-center gap-2 rounded-sm uppercase tracking-[0.11em] transition-all duration-300";

  const sizing =
    size === "compact" ? "min-h-9 px-3 text-micro" : "min-h-11 px-4 py-2.5 text-label";

  const skin =
    variant === "solid"
      ? "bg-signal text-bg hover:opacity-88"
      : "border border-signal/45 text-signal hover:border-signal hover:bg-signal/8";

  const width = fullWidth ? "w-full justify-center sm:w-auto" : "";

  return (
    <a
      href={links.cal}
      target="_blank"
      rel="noreferrer noopener"
      className={cx(base, sizing, skin, width, className)}
    >
      <span
        aria-hidden="true"
        className={cx(
          "inline-block size-1.5 shrink-0 animate-pulse rounded-full",
          variant === "solid" ? "bg-bg" : "bg-signal",
        )}
      />
      {label}
      <span
        aria-hidden="true"
        className="transition-transform duration-300 group-hover:translate-x-0.5"
      >
        ↗
      </span>
    </a>
  );
}
