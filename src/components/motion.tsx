"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import {
  createElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cx } from "@/lib/utils";

/**
 * MOTION SYSTEM
 *
 * Every component here checks `useReducedMotion` and degrades to a static
 * render. Motion is used in four places only, each doing a job:
 *
 *   TextReveal   — establishes hierarchy on arrival, one line at a time
 *   Marquee      — reads as a ticker; conveys breadth without a wall of tags
 *   Magnetic     — makes primary actions feel physical under a pointer
 *   PageTransition — hides the layout shift between routes
 *
 * There is no fifth. Scattered effects read as an AI-generated page; a small
 * number of orchestrated ones read as design.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

/* ────────────────────────────────────────────────────── reveal (shared) ── */

/**
 * One IntersectionObserver hook, used by both reveal components.
 *
 * These are deliberately NOT Framer Motion. `whileInView` renders the resting
 * state on the server and the initial state on the client, which React reports
 * as a hydration mismatch — it then throws away the server HTML and re-renders,
 * and the entrance animations are lost in the process. The start state lives in
 * globals.css instead, so there is no inline style for the two passes to
 * disagree about, and the transition runs on the compositor.
 */
function useReveal<T extends HTMLElement>(): React.RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          element.setAttribute("data-revealed", "");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return ref;
}

/* ─────────────────────────────────────────────────────────── text reveal ── */

/**
 * Splits on words and lifts each out of an overflow-hidden mask, staggered.
 *
 * Words rather than characters: a character stagger on a long headline looks
 * like a slot machine and wrecks readability for anyone using a screen
 * magnifier. The full string stays in the DOM as one accessible name, so
 * assistive technology reads a sentence rather than a list of fragments.
 */
export function TextReveal({
  text,
  className,
  delay = 0,
  as: Tag = "h1",
}: {
  text: string;
  className?: string;
  /** Seconds, to match the Framer-based components it sits alongside. */
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p";
}) {
  const ref = useReveal<HTMLHeadingElement>();
  const words = text.split(" ");

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} aria-hidden="true" className="word-mask">
          <span
            style={{
              ["--word-delay" as string]: `${Math.round(delay * 1000 + i * 35)}ms`,
            }}
          >
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/* ───────────────────────────────────────────────────────────────── fade ── */

/**
 * `as` is a closed union and the element is built with createElement rather
 * than JSX. React Three Fiber augments the global JSX namespace with its own
 * intrinsic elements, which makes an open polymorphic tag carrying a ref
 * unresolvable to TypeScript. This keeps it type-safe without a cast.
 */
type RevealTag = "div" | "section" | "article" | "li" | "header" | "figure";

export function FadeIn({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  /** Seconds. */
  delay?: number;
  className?: string;
  as?: RevealTag;
}) {
  const ref = useReveal<HTMLElement>();

  return createElement(
    as,
    {
      ref,
      "data-reveal": "",
      className,
      style: { ["--reveal-delay" as string]: `${Math.round(delay * 1000)}ms` },
    },
    children,
  );
}

/* ─────────────────────────────────────────────────────────────── marquee ── */

/**
 * CSS-animated rather than JS-driven: it runs on the compositor and costs
 * nothing on the main thread even while the 3D scene is rendering. The track is
 * duplicated so the loop is seamless; the duplicate is hidden from assistive
 * technology so the list is not announced twice.
 */
export function Marquee({
  items,
  duration = 42,
}: {
  items: readonly string[];
  duration?: number;
}) {
  const track = (
    <ul className="flex shrink-0 items-center gap-8 pr-8">
      {items.map((item) => (
        <li key={item} className="label flex items-center gap-8 whitespace-nowrap">
          {item}
          <span aria-hidden="true" className="text-signal">
            ◆
          </span>
        </li>
      ))}
    </ul>
  );

  // The track speed is modulated by --scroll-velocity, published centrally by
  // <ScrollVelocity />. Scrolling down pushes the ticker along; scrolling up
  // drags against it. It settles back to its base speed when the reader stops.
  return (
    <div
      className="marquee border-y border-rule py-4"
      style={{ ["--marquee-duration" as string]: `${duration}s` }}
    >
      <div className="marquee-track">
        {track}
        <div aria-hidden="true" className="contents">
          {track}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── magnetic ── */

/** Pulls an element a few pixels toward the pointer. Capped at 6px — enough to
 *  feel responsive, small enough that the click target never moves out from
 *  under the cursor. */
export function Magnetic({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const onMove = useCallback(
    (event: React.MouseEvent<HTMLSpanElement>) => {
      if (reduced) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = event.clientX - (rect.left + rect.width / 2);
      const y = event.clientY - (rect.top + rect.height / 2);
      setOffset({
        x: Math.max(-6, Math.min(6, x * 0.25)),
        y: Math.max(-6, Math.min(6, y * 0.25)),
      });
    },
    [reduced],
  );

  return (
    <motion.span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      animate={offset}
      transition={{ type: "spring", stiffness: 320, damping: 22, mass: 0.4 }}
      // block below sm so a full-width child fills the row; inline-block from
      // sm up so buttons sit on their intrinsic width in a flex row.
      className="block sm:inline-block"
    >
      {children}
    </motion.span>
  );
}

/* ─────────────────────────────────────────────────────── page transition ── */

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  if (reduced) return <>{children}</>;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.32, ease: EASE }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/* ────────────────────────────────────────────────────────────── cursor ──── */

/**
 * A small dot that trails the pointer and expands over interactive elements.
 *
 * Mounted only on devices with a fine pointer — a custom cursor on a
 * touchscreen is dead weight — and never when reduced motion is set. The
 * default cursor is not hidden: replacing it entirely breaks the affordances
 * people rely on (text I-beam, resize handles) for a decorative gain.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const evaluate = () => setEnabled(fine.matches && !still.matches);
    evaluate();
    fine.addEventListener("change", evaluate);
    still.addEventListener("change", evaluate);
    return () => {
      fine.removeEventListener("change", evaluate);
      still.removeEventListener("change", evaluate);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;

    const onMove = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      const el = event.target as HTMLElement | null;
      setActive(Boolean(el?.closest("a, button, [role='button'], input, textarea")));
    };

    // Positioned with a transform inside rAF rather than in React state, so
    // pointer movement never triggers a re-render.
    const loop = () => {
      x += (targetX - x) * 0.18;
      y += (targetY - y) * 0.18;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dot}
      aria-hidden="true"
      className={cx(
        "pointer-events-none fixed top-0 left-0 z-[90] rounded-full border border-signal transition-[width,height,background-color] duration-300 ease-out",
        active ? "size-9 bg-signal/10" : "size-3 bg-signal/40",
      )}
    />
  );
}
