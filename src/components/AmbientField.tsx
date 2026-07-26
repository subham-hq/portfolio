"use client";

import { useEffect, useRef } from "react";
import { scroll } from "@/lib/scroll";

/**
 * AMBIENT FIELD
 *
 * A full-viewport canvas that sits behind everything and reacts to the pointer.
 * Two modes, chosen by the active theme, each carrying a different idea:
 *
 *   dark  — a starfield in three depth layers. The cursor is a void: stars are
 *           pushed out of its radius, more strongly the nearer they are, so
 *           moving the mouse opens a clearing in the sky and it closes behind
 *           you. Parallax drift is scaled by depth, so the layers separate.
 *
 *   light — a measurement field: a regular grid of marks on drafting paper.
 *           The cursor behaves like a lens — marks near it are displaced
 *           outward and grow slightly, as though the paper were being viewed
 *           through glass. Same interaction, opposite register: night sky
 *           versus engineering drawing.
 *
 * Why one canvas rather than two components: the particle loop, the pointer
 * damping, the resize handling and the visibility gating are identical. Only
 * the seeding and the per-frame displacement differ.
 *
 * ── Receiving the hero ─────────────────────────────────────────────────────
 * As the lattice above comes apart, this field brightens and its particles
 * drift a little faster. The scattered nodes appear to arrive here. Nothing
 * is literally handed between the two — one is WebGL, the other Canvas 2D —
 * but they read the same scroll value, so the transition lands as a single
 * continuous event rather than one thing ending and another beginning.
 *
 * Cost control:
 *   · particle count scales with viewport area and is hard-capped
 *   · fillRect, not arc — at 1–3px the shape is indistinguishable and the
 *     rasteriser is several times faster
 *   · DPR clamped to 1.5
 *   · rAF stops entirely when the tab is hidden
 *   · prefers-reduced-motion renders one static frame and never loops
 *   · mounted client-side only, so it cannot cause a hydration mismatch
 */

interface Particle {
  /** Base position in CSS pixels. */
  x: number;
  y: number;
  /** Depth, 0 (far) to 1 (near). Drives parallax, size and displacement. */
  z: number;
  size: number;
  /** Phase offset so twinkle is not synchronised. */
  phase: number;
}

const MAX_PARTICLES = 420;
const CURSOR_RADIUS = 190;
const DPR_CAP = 1.5;

/** Deterministic PRNG — the field is identical on every mount rather than
 *  reshuffling each time the user navigates back to a page. */
function seeded(i: number, salt = 0): number {
  const value = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function seedStars(width: number, height: number): Particle[] {
  const target = Math.min(MAX_PARTICLES, Math.round((width * height) / 4200));
  return Array.from({ length: target }, (_, i) => {
    const z = seeded(i, 3);
    return {
      x: seeded(i, 1) * width,
      y: seeded(i, 2) * height,
      z,
      size: 0.6 + z * 1.7,
      phase: seeded(i, 4) * Math.PI * 2,
    };
  });
}

/**
 * The grid is structural rather than decorative — it has to reach the bottom
 * of the viewport or the page looks half-finished. The starfield's 420-particle
 * cap is a density choice and can be applied bluntly; applying the same cap
 * here silently truncated the grid, and at 1920x1080 it was covering only the
 * top 266 pixels of a 1080-pixel screen.
 *
 * So the pitch adapts instead: start at 38px and open it up until the grid
 * fits the budget. Large screens get a slightly sparser grid, which is the
 * right answer visually anyway — 38px across an ultrawide reads as clutter.
 */
const GRID_BUDGET = 1800;
const GRID_MIN_PITCH = 38;

function seedGrid(
  width: number,
  height: number,
): { particles: Particle[]; spacing: number } {
  let spacing = GRID_MIN_PITCH;

  // One extra column and row on each side, so the scroll offset below can
  // never expose an empty strip along an edge.
  const count = (pitch: number) =>
    (Math.ceil(width / pitch) + 3) * (Math.ceil(height / pitch) + 3);

  while (count(spacing) > GRID_BUDGET) spacing += 4;

  const cols = Math.ceil(width / spacing) + 2;
  const rows = Math.ceil(height / spacing) + 2;
  const particles: Particle[] = [];

  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      particles.push({
        x: col * spacing,
        y: row * spacing,
        z: 1,
        size: 1.4,
        phase: 0,
      });
    }
  }

  return { particles, spacing };
}

export function AmbientField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let gridSpacing = GRID_MIN_PITCH;
    let mode: "dark" | "light" =
      document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    let ink = "#5a615f";
    let accent = "#0f7a72";

    // Pointer is tracked in a ref-like closure and damped, so a fast flick
    // trails rather than snapping.
    const pointer = { x: -9999, y: -9999 };
    const damped = { x: -9999, y: -9999 };

    let raf = 0;
    let running = false;
    let start = performance.now();

    const readTheme = () => {
      const styles = getComputedStyle(document.documentElement);
      mode =
        document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      ink = styles.getPropertyValue("--fg-faint").trim() || ink;
      accent = styles.getPropertyValue("--signal").trim() || accent;
    };

    const seed = () => {
      if (mode === "dark") {
        particles = seedStars(width, height);
        return;
      }
      const grid = seedGrid(width, height);
      particles = grid.particles;
      gridSpacing = grid.spacing;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);

      // Damped pointer follow. On touch devices the pointer stays parked
      // off-screen, so the displacement term is simply never active.
      damped.x += (pointer.x - damped.x) * 0.09;
      damped.y += (pointer.y - damped.y) * 0.09;

      // Rises from 0 to 1 across the first viewport, matching the lattice
      // dissolve exactly. Both read the same store. Saturates at 1 — it drives
      // the hero handoff only, never the ongoing motion.
      const arrival = scroll.heroExit;

      // Scroll-linked offset, in pixels, for the whole document rather than
      // the first screen. This is the part that was missing: drift used to be
      // purely time-based, with `arrival` as a speed multiplier — so once the
      // hero was gone that multiplier pinned at 1 and nothing on the page
      // responded to scrolling again. Deriving position from scroll.y instead
      // means the field tracks the reader the whole way down and reverses when
      // they scroll back up.
      //
      // Raw scroll.y rather than scroll.progress, deliberately: the feel
      // should be the same on a short page and a long one, so the coupling is
      // per pixel scrolled, not per percent of document.
      const gridOffset = (((scroll.y * 0.09) % gridSpacing) + gridSpacing) % gridSpacing;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]!;

        let x = p.x;
        let y = p.y;

        if (!reduced) {
          if (mode === "dark") {
            // Two components. The time drift keeps the sky alive when the page
            // is still; the scroll term makes it a parallax layer while the
            // page moves. Both scale with depth, so near stars travel further
            // than far ones and the field reads as having volume.
            const drift = t * (4 + p.z * 14);
            const parallax = scroll.y * (0.05 + p.z * 0.17);
            x = (p.x + drift + parallax) % (width + 40);
            y = p.y + Math.sin(t * 0.18 + p.phase) * (1 + p.z * 3);
          } else {
            // The measurement grid slides with scroll too, so light mode is
            // not the one theme where scrolling does nothing. Wrapped on the
            // grid pitch, which keeps it a regular grid at every offset
            // instead of sliding out of alignment.
            x = p.x + gridOffset;
          }
        }

        // Cursor displacement — the shared interaction across both modes.
        const dx = x - damped.x;
        const dy = y - damped.y;
        const distance = Math.hypot(dx, dy);

        let size = p.size;

        if (distance < CURSOR_RADIUS && distance > 0.01) {
          const falloff = 1 - distance / CURSOR_RADIUS;
          const eased = falloff * falloff;

          if (mode === "dark") {
            // Push outward: the cursor carves a clearing in the sky.
            const push = eased * 58 * (0.35 + p.z);
            x += (dx / distance) * push;
            y += (dy / distance) * push;
          } else {
            // Lens: marks spread and swell slightly, as through glass.
            const push = eased * 26;
            x += (dx / distance) * push;
            y += (dy / distance) * push;
            size = p.size * (1 + eased * 1.5);
          }
        }

        if (mode === "dark") {
          const twinkle = reduced ? 1 : 0.65 + Math.sin(t * 1.1 + p.phase) * 0.35;
          // Up to 45% brighter once the hero has fully dissolved.
          ctx.globalAlpha = (0.16 + p.z * 0.52) * twinkle * (1 + arrival * 0.45);
          // A small share of stars take the accent hue, so the field belongs
          // to this palette rather than being generic white noise.
          ctx.fillStyle = seeded(i, 9) > 0.9 ? accent : "#dfe6ec";
        } else {
          const proximity = distance < CURSOR_RADIUS ? 1 - distance / CURSOR_RADIUS : 0;
          ctx.globalAlpha = 0.16 + proximity * 0.4;
          ctx.fillStyle = proximity > 0.55 ? accent : ink;
        }

        ctx.fillRect(x - size / 2, y - size / 2, size, size);
      }

      ctx.globalAlpha = 1;
      if (running && !reduced) raf = requestAnimationFrame(draw);
    };

    const play = () => {
      if (running || reduced) return;
      running = true;
      start = performance.now() - 1000;
      raf = requestAnimationFrame(draw);
    };

    const pause = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    };

    const onPointerLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    const onVisibility = () => (document.hidden ? pause() : play());

    readTheme();
    resize();

    if (reduced) {
      draw(performance.now());
    } else {
      play();
    }

    window.addEventListener("resize", resize);
    if (!coarse) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.addEventListener("pointerleave", onPointerLeave);
    }
    document.addEventListener("visibilitychange", onVisibility);

    const themeObserver = new MutationObserver(() => {
      readTheme();
      seed();
      if (reduced) draw(performance.now());
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      pause();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      // z-0, not a negative index: `body` paints an opaque background, and a
      // negative z-index would place the canvas behind it where nothing is
      // visible. Content sits at z-index 2.
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
