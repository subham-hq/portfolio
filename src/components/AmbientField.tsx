"use client";

import { useEffect, useRef } from "react";

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

function seedGrid(width: number, height: number): Particle[] {
  const spacing = 38;
  const cols = Math.ceil(width / spacing) + 1;
  const rows = Math.ceil(height / spacing) + 1;
  const particles: Particle[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (particles.length >= MAX_PARTICLES) return particles;
      particles.push({
        x: col * spacing,
        y: row * spacing,
        z: 1,
        size: 1.4,
        phase: 0,
      });
    }
  }
  return particles;
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
      particles = mode === "dark" ? seedStars(width, height) : seedGrid(width, height);
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

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]!;

        let x = p.x;
        let y = p.y;

        if (mode === "dark" && !reduced) {
          // Parallax drift, scaled by depth. Wraps rather than resetting so
          // there is no visible seam.
          x = (p.x + t * (4 + p.z * 14)) % (width + 40);
          y = p.y + Math.sin(t * 0.18 + p.phase) * (1 + p.z * 3);
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
          ctx.globalAlpha = (0.16 + p.z * 0.52) * twinkle;
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
