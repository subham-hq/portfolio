import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/lib/utils";
import { FadeIn, TextReveal } from "./motion";

/** The structural primitive: a mono key beside a wide value. Used everywhere. */
export function SpecRow({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("spec-row", className)}>
      {/* Optical padding now lives in the stylesheet, applied only from 48rem
          where the key and value sit side by side. Stacked, it read as a gap. */}
      <dt className="label">{label}</dt>
      <dd className="m-0 min-w-0">{children}</dd>
    </div>
  );
}

export function Section({
  id,
  title,
  aside,
  children,
  className,
}: {
  id?: string;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cx("border-t border-rule-strong py-band", className)}>
      <FadeIn className="mb-7 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 sm:mb-10">
        <h2 className="label rule-sweep !text-fg-muted">{title}</h2>
        {aside ? <div className="label">{aside}</div> : null}
      </FadeIn>
      {children}
    </section>
  );
}

export function Prose({ paragraphs }: { paragraphs: readonly string[] }) {
  return (
    <div className="prose-measure text-lead text-fg-muted">
      {paragraphs.map((p) => (
        <p key={p.slice(0, 32)}>{p}</p>
      ))}
    </div>
  );
}

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "solid" | "outline";
  external?: boolean;
  /** Stacks full-width below 640px, then returns to intrinsic width. */
  fullWidth?: boolean;
};

export function Button({
  href,
  children,
  variant = "solid",
  external,
  fullWidth,
}: ButtonProps) {
  // min-h-11 is 44px — the WCAG 2.5.8 / Apple HIG minimum. The previous
  // px-4 py-2.5 box measured 36px, so every call to action on the site was
  // under the threshold.
  const base =
    "mono inline-flex min-h-11 items-center gap-2 rounded-sm px-4 py-2.5 text-label uppercase tracking-[0.11em] transition-all duration-300";
  const styles =
    variant === "solid"
      ? "bg-fg text-bg hover:opacity-85"
      : "border border-rule-strong text-fg-muted hover:border-signal hover:text-signal";

  const width = fullWidth ? "w-full justify-center sm:w-auto sm:justify-start" : "";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={cx(base, styles, width)}
      >
        {children}
        <span aria-hidden="true">↗</span>
      </a>
    );
  }
  return (
    <Link href={href} className={cx(base, styles, width)}>
      {children}
      <span aria-hidden="true">→</span>
    </Link>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="mono rounded-xs border border-rule px-2 py-0.5 text-micro text-fg-faint">
      {children}
    </span>
  );
}

/** A small coloured dot that encodes which of the two tracks something belongs to. */
export function TrackDot({ track }: { track: "systems" | "operations" }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "mt-[0.55rem] inline-block size-1.5 shrink-0 rounded-full",
        track === "systems" ? "bg-signal" : "bg-ledger",
      )}
    />
  );
}

export function PageHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
}) {
  return (
    <header className="py-band">
      <FadeIn>
        <p className="label rule-sweep mb-4 inline-block sm:mb-6">{eyebrow}</p>
      </FadeIn>
      {/* Every page opens the way the index does: eyebrow, then a word-masked
          heading, then the lede. The rhythm is what makes eleven different
          routes read as one site. */}
      <TextReveal as="h1" text={title} className="font-display text-h1 max-w-[16ch]" />
      {lede ? (
        <FadeIn delay={0.18}>
          <p className="prose-measure mt-6 text-lead text-fg-muted sm:mt-8">{lede}</p>
        </FadeIn>
      ) : null}
    </header>
  );
}
