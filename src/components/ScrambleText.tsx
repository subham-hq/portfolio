"use client";

import { useEffect, useRef } from "react";

/**
 * SCRAMBLE TEXT
 *
 * Characters resolve left to right out of a stream of random glyphs — the
 * decryption effect. Runs on every visit rather than once per session, because
 * it is the first thing a returning visitor sees and it is the reason they
 * remember the page.
 *
 * The character set is hex digits and code punctuation rather than random
 * letters. It reads as a buffer resolving rather than a slot machine, which is
 * the right register for this site.
 *
 * Three things make this safe rather than merely showy:
 *
 *   1. HYDRATION. The server renders the final string. The client renders the
 *      same string, then mutates `textContent` directly inside an effect —
 *      after hydration, so there is nothing for React to diff and nothing to
 *      mismatch. This is the bug that has bitten this project twice; doing the
 *      animation in React state would reintroduce it.
 *
 *   2. NO RE-RENDERS. The rAF loop writes to two DOM nodes through refs. A
 *      60fps React re-render of a 50-character subtree would be pure waste.
 *
 *   3. ACCESSIBILITY. The real text is the accessible name via aria-label, and
 *      both animated spans are aria-hidden. A screen reader reads one clean
 *      sentence, never a stream of glyphs. Under prefers-reduced-motion the
 *      effect does not run at all.
 */

const GLYPHS = "ABCDEF0123456789<>/\\[]{}()=+*_-#$%&@!?;:";

/** Deterministic per-character delay curve, so the resolve sweeps rather than
 *  popping. Slight jitter keeps it from looking mechanical. */
function resolveAt(index: number, total: number, duration: number): number {
  const sweep = (index / Math.max(total - 1, 1)) * duration * 0.72;
  const jitter = ((Math.sin(index * 12.9898) * 43758.5453) % 1) * duration * 0.16;
  return sweep + Math.abs(jitter);
}

export function ScrambleText({
  text,
  className,
  as: Tag = "h1",
  /** Milliseconds until the last character settles. */
  duration = 1400,
  /** Milliseconds before the effect begins. */
  delay = 120,
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  duration?: number;
  delay?: number;
}) {
  const resolved = useRef<HTMLSpanElement>(null);
  const pending = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const resolvedEl = resolved.current;
    const pendingEl = pending.current;
    if (!resolvedEl || !pendingEl) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const chars = [...text];
    const times = chars.map((_, i) => resolveAt(i, chars.length, duration));

    let raf = 0;
    let start = 0;
    let lastScramble = 0;
    let scrambleCache = "";

    // Start hidden rather than showing the full string for one frame before
    // the first rAF tick fires.
    resolvedEl.textContent = "";
    pendingEl.textContent = "";

    const tick = (now: number) => {
      if (!start) start = now;
      const elapsed = now - start - delay;

      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }

      let cut = 0;
      while (cut < chars.length && elapsed >= times[cut]!) cut += 1;

      resolvedEl.textContent = chars.slice(0, cut).join("");

      if (cut >= chars.length) {
        pendingEl.textContent = "";
        return;
      }

      // Refresh the scrambled tail on a slower clock than the frame rate.
      // At 60fps every character would change every 16ms, which reads as
      // static noise rather than as characters cycling.
      if (now - lastScramble > 42) {
        lastScramble = now;
        scrambleCache = chars
          .slice(cut)
          .map((char) =>
            char === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
          )
          .join("");
      }
      pendingEl.textContent = scrambleCache;

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, duration, delay]);

  return (
    <Tag className={className} aria-label={text}>
      <span ref={resolved} aria-hidden="true">
        {text}
      </span>
      <span ref={pending} aria-hidden="true" className="scramble-pending" />
    </Tag>
  );
}
