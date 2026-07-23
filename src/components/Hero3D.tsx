"use client";

import { Canvas } from "@react-three/fiber";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

/**
 * Gate and fallback for the 3D hero.
 *
 * The scene is code-split and only mounted when it is genuinely appropriate.
 * It does not load at all when the viewport is under 768px, when
 * prefers-reduced-motion is set, when the device reports limited memory, or
 * when WebGL is unavailable. In every one of those cases the static SVG below
 * renders instead — the same composition, a fraction of a kilobyte. Nobody
 * sees an empty box and nobody downloads a renderer they cannot use.
 */

const Lattice = dynamic(() => import("./Lattice").then((m) => m.Lattice), {
  ssr: false,
});

const FALLBACK_ACCENTS = { signal: "#46c9bd", ledger: "#d5a44a" } as const;

function readAccents() {
  if (typeof window === "undefined") return FALLBACK_ACCENTS;
  const styles = getComputedStyle(document.documentElement);
  return {
    signal: styles.getPropertyValue("--signal").trim() || FALLBACK_ACCENTS.signal,
    ledger: styles.getPropertyValue("--ledger").trim() || FALLBACK_ACCENTS.ledger,
  };
}

/**
 * Node table for the static fallback.
 *
 * These are literals, not computed at render time, and that is deliberate.
 * The original version derived them with Math.cos / Math.sin. ECMAScript does
 * not require transcendental functions to be bit-identical across engines, so
 * V8 (the Node server) and JavaScriptCore (Safari) returned values differing in
 * the last unit in the last place:
 *
 *   server  cx="64.79440949762451"
 *   client  cx={64.79440949762453}
 *
 * React compares the serialised attribute, so that one-digit difference is a
 * hydration mismatch — it discards the server HTML and re-renders the tree.
 * Rounding would make it improbable; a literal table makes it impossible, and
 * costs nothing since the layout is fixed anyway.
 *
 * Tuple order is [cx, cy, r] in the 100x100 viewBox.
 */
const FALLBACK_NODES: readonly (readonly [number, number, number])[] = [
  [61.0, 50.0, 0.7],
  [38.14, 60.02, 0.92],
  [51.81, 30.57, 1.14],
  [66.06, 69.16, 1.36],
  [19.06, 45.08, 0.7],
  [80.7, 31.84, 0.92],
  [39.43, 87.02, 1.14],
  [44.86, 41.05, 1.36],
  [65.17, 54.97, 0.7],
  [30.47, 57.6, 0.92],
  [60.92, 27.99, 1.14],
  [59.71, 77.47, 1.36],
  [18.21, 33.5, 0.7],
  [90.51, 41.31, 0.92],
  [43.8, 58.36, 1.14],
  [47.7, 35.34, 1.36],
  [66.42, 62.34, 0.7],
  [23.74, 51.4, 0.92],
  [71.87, 29.27, 1.14],
  [48.98, 83.57, 1.36],
  [22.74, 21.09, 0.7],
  [60.93, 51.15, 0.92],
  [36.98, 58.72, 1.14],
  [54.19, 30.88, 1.36],
  [63.6, 70.71, 0.7],
  [19.86, 41.89, 0.92],
  [82.74, 35.16, 1.14],
  [34.94, 85.68, 1.36],
  [46.0, 40.57, 0.7],
  [64.46, 56.52, 0.92],
  [29.66, 55.51, 1.14],
  [63.56, 29.27, 1.36],
  [56.27, 78.31, 0.7],
  [20.45, 30.29, 0.92],
  [91.32, 45.59, 1.14],
  [42.81, 57.66, 1.36],
  [49.52, 35.19, 0.7],
  [64.79, 63.97, 0.92],
];

/** Static stand-in. Same visual language, no renderer, no JavaScript. */
function LatticeFallback() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-full w-full"
      role="img"
      aria-label="Abstract lattice of connected nodes"
    >
      <g stroke="var(--signal)" strokeWidth="0.14" opacity="0.28">
        {FALLBACK_NODES.map(([cx, cy], i) => {
          const next = FALLBACK_NODES[(i + 5) % FALLBACK_NODES.length]!;
          return <line key={i} x1={cx} y1={cy} x2={next[0]} y2={next[1]} />;
        })}
      </g>
      <g fill="var(--signal)">
        {FALLBACK_NODES.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} opacity={0.45 + (i % 3) * 0.2} />
        ))}
      </g>
    </svg>
  );
}

export function Hero3D() {
  const container = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [accents, setAccents] = useState<{ signal: string; ledger: string }>(
    FALLBACK_ACCENTS,
  );
  // "always" while on screen, "never" once scrolled past or the tab is hidden.
  const [frameloop, setFrameloop] = useState<"always" | "never">("never");

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sizeQuery = window.matchMedia("(min-width: 768px)");

    const capable = (() => {
      try {
        // navigator.deviceMemory is Chromium-only; absent means "assume fine".
        const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
        if (typeof memory === "number" && memory < 4) return false;
        const probe = document.createElement("canvas");
        return Boolean(
          window.WebGLRenderingContext &&
          (probe.getContext("webgl") || probe.getContext("experimental-webgl")),
        );
      } catch {
        return false;
      }
    })();

    const evaluate = () =>
      setEnabled(capable && sizeQuery.matches && !motionQuery.matches);

    evaluate();
    setAccents(readAccents());

    motionQuery.addEventListener("change", evaluate);
    sizeQuery.addEventListener("change", evaluate);

    const themeObserver = new MutationObserver(() => setAccents(readAccents()));
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      motionQuery.removeEventListener("change", evaluate);
      sizeQuery.removeEventListener("change", evaluate);
      themeObserver.disconnect();
    };
  }, []);

  /**
   * Drive the frameloop from visibility.
   *
   * This previously passed frameloop="always" with a comment claiming it
   * paused off-screen. It did not — the scene rendered continuously behind
   * every other section of the page and in backgrounded tabs, burning GPU and
   * battery for pixels nobody could see.
   */
  useEffect(() => {
    if (!enabled) {
      setFrameloop("never");
      return;
    }
    const element = container.current;
    if (!element) return;

    let onScreen = false;
    const sync = () => setFrameloop(onScreen && !document.hidden ? "always" : "never");

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry?.isIntersecting ?? false;
        sync();
      },
      { threshold: 0 },
    );
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [enabled]);

  return (
    <div
      ref={container}
      className="pointer-events-none relative h-[190px] w-full sm:h-[300px] lg:h-[460px]"
    >
      {enabled ? (
        <Canvas
          camera={{ position: [0, 0, 11], fov: 42 }}
          dpr={[1, 1.5]}
          frameloop={frameloop}
          gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        >
          <Lattice signal={accents.signal} ledger={accents.ledger} />
        </Canvas>
      ) : (
        <LatticeFallback />
      )}
    </div>
  );
}
