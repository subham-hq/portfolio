"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@/lib/utils";

/**
 * Supporting effects. Each is here because it does a job, not because it is
 * possible: a reader should be able to say what every one of them tells them.
 */

/* ────────────────────────────────────────────────────── scroll progress ── */

/**
 * A hairline at the top of the viewport showing how far through the page you
 * are. On a long index this answers "how much is left" without a scrollbar,
 * which Safari hides by default.
 *
 * Driven by a scroll listener throttled to one frame. `scaleX` on a
 * transform-only element stays on the compositor, so scrolling is unaffected.
 */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      if (bar.current) {
        bar.current.style.transform = `scaleX(${Math.min(progress, 1)})`;
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="no-print pointer-events-none fixed inset-x-0 top-0 z-[60] h-px bg-transparent"
    >
      <div
        ref={bar}
        className="h-full origin-left bg-signal"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}

/* ───────────────────────────────────────────────────────────── count up ── */

/**
 * Counts a figure up when it first enters view.
 *
 * The final value is rendered on the server and is what a crawler or a
 * no-JavaScript reader sees; the animation only ever replaces a number with
 * the same number. `tabular-nums` on the parent keeps the width fixed so the
 * layout does not jitter while it runs.
 */
export function CountUp({
  value,
  duration = 1100,
}: {
  /** Rendered verbatim if it is not numeric, so "2030" and "N/A" both work. */
  value: string;
  duration?: number;
}) {
  const target = Number(value);
  const numeric = Number.isFinite(target);
  const pad = value.startsWith("0") ? value.length : 0;

  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const element = ref.current;
    if (!element || !numeric) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          // easeOutExpo — fast then settling, which reads as a counter coming
          // to rest rather than a linear ramp.
          const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          const current = Math.round(target * eased);
          setDisplay(pad ? String(current).padStart(pad, "0") : String(current));
          if (progress < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, numeric, pad, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────── spotlight ── */

/**
 * Writes the pointer position into CSS custom properties so a card can light
 * up under the cursor. The gradient itself lives in globals.css — this only
 * supplies coordinates, and only while the pointer is actually over the card.
 *
 * Pointer-only: on touch there is no hover state to reward, so the listeners
 * are never attached.
 */
export function Spotlight({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let raf = 0;

    const onMove = (event: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = element.getBoundingClientRect();
        element.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
        element.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
      });
    };

    const onEnter = () => element.setAttribute("data-lit", "");
    const onLeave = () => {
      element.removeAttribute("data-lit");
      cancelAnimationFrame(raf);
      raf = 0;
    };

    element.addEventListener("pointermove", onMove, { passive: true });
    element.addEventListener("pointerenter", onEnter);
    element.addEventListener("pointerleave", onLeave);

    return () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerenter", onEnter);
      element.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────── parallax ── */

/**
 * Drifts an element against the scroll at a fraction of the page speed.
 * Used sparingly — on the hero only — to give the first screen a sense of
 * depth as it leaves. Anything more and the page starts to feel unmoored.
 */
export function Parallax({
  children,
  speed = 0.12,
  className,
}: {
  children: ReactNode;
  /** Fraction of scroll distance. Keep it under 0.2. */
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let visible = true;

    const update = () => {
      raf = 0;
      if (!visible) return;
      element.style.transform = `translate3d(0, ${window.scrollY * speed}px, 0)`;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
    });
    observer.observe(element);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── back to top ── */

/**
 * Appears once the reader is well past the fold. The index runs to eleven
 * sections; expecting someone to scroll back by hand is a small cruelty.
 */
export function BackToTop() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      setShown(window.scrollY > window.innerHeight * 1.5);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        })
      }
      aria-label="Back to top"
      // Kept out of the tab order while hidden, so keyboard users do not land
      // on an invisible control.
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
      className={cx(
        "no-print surface fixed right-5 bottom-5 z-40 grid size-11 place-items-center rounded-sm border border-rule-strong text-fg-muted transition-all duration-500",
        shown
          ? "translate-y-0 opacity-100 hover:border-signal hover:text-signal"
          : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <span aria-hidden="true">↑</span>
    </button>
  );
}

/* ──────────────────────────────────────────────────── scroll-linked rail ── */

/**
 * Writes normalised scroll velocity into a CSS custom property on <html>.
 *
 * One listener, one property, and any number of effects can read it — the
 * marquee leans into the scroll direction, and the value decays back to rest
 * when the reader stops. Doing this once centrally avoids every animated
 * element attaching its own scroll listener.
 */
export function ScrollVelocity() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let last = window.scrollY;
    let velocity = 0;
    let raf = 0;

    const loop = () => {
      const current = window.scrollY;
      const delta = current - last;
      last = current;

      // Blend toward the new delta, then decay, so the value eases rather
      // than spiking on every frame.
      velocity += (delta - velocity) * 0.16;
      velocity *= 0.92;

      const normalised = Math.max(-1, Math.min(1, velocity / 26));
      document.documentElement.style.setProperty(
        "--scroll-velocity",
        normalised.toFixed(3),
      );

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.style.removeProperty("--scroll-velocity");
    };
  }, []);

  return null;
}
