"use client";

import { useEffect, useRef } from "react";

/**
 * SIGNATURE ELEMENT
 *
 * The hero is a running state machine — specifically the order lifecycle from
 * OrderFlow. Rather than decorating the page with a 3D object that says nothing,
 * the most characteristic artefact of the subject's own work is the thing you
 * see first: states, legal transitions, and a token moving between them.
 *
 * Deliberately Canvas 2D and not Three.js. A WebGL scene would add ~600 kB to
 * a backend engineer's homepage to communicate less. This is ~4 kB, runs at
 * 60fps on a mid-range phone, pauses when off-screen, and stops entirely under
 * prefers-reduced-motion.
 */

type StateId = "pending" | "approved" | "fulfilled" | "rejected";

interface Node {
  id: StateId;
  label: string;
  /** Normalised position in the drawing box. */
  x: number;
  y: number;
  terminal: boolean;
}

const NODES: Node[] = [
  { id: "pending", label: "pending", x: 0.09, y: 0.5, terminal: false },
  { id: "approved", label: "approved", x: 0.42, y: 0.5, terminal: false },
  { id: "fulfilled", label: "fulfilled", x: 0.81, y: 0.24, terminal: true },
  { id: "rejected", label: "rejected", x: 0.81, y: 0.78, terminal: true },
];

const EDGES: [StateId, StateId][] = [
  ["pending", "approved"],
  ["approved", "fulfilled"],
  ["approved", "rejected"],
];

/** The only paths an order may take. Weighted so most orders are fulfilled. */
const RUNS: StateId[][] = [
  ["pending", "approved", "fulfilled"],
  ["pending", "approved", "fulfilled"],
  ["pending", "approved", "rejected"],
];

const TRAVEL_MS = 1150;
const DWELL_MS = 620;

function node(id: StateId): Node {
  return NODES.find((n) => n.id === id) ?? NODES[0]!;
}

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function StateMachine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let raf = 0;
    let visible = true;
    let runIndex = 0;
    let legIndex = 0;
    let legStart = performance.now();
    let dwelling = true;

    const readTokens = () => {
      const styles = getComputedStyle(document.documentElement);
      return {
        rule: styles.getPropertyValue("--rule-strong").trim() || "#c6cac7",
        fg: styles.getPropertyValue("--fg").trim() || "#0e1414",
        muted: styles.getPropertyValue("--fg-faint").trim() || "#5a615f",
        signal: styles.getPropertyValue("--signal").trim() || "#0f7a72",
        stop: styles.getPropertyValue("--stop").trim() || "#a83c29",
        bg: styles.getPropertyValue("--bg").trim() || "#f4f5f3",
      };
    };

    let palette = readTokens();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const px = (n: Node) => ({ x: n.x * width, y: n.y * height });

    const draw = (now: number) => {
      const compact = width < 520;
      const r = compact ? 6 : 7.5;
      const fontSize = compact ? 10 : 12;

      ctx.clearRect(0, 0, width, height);

      const run = RUNS[runIndex] ?? RUNS[0]!;
      const from = node(run[legIndex] ?? "pending");
      const to = node(run[legIndex + 1] ?? "approved");

      let progress = 0;
      if (!reduced) {
        const elapsed = now - legStart;
        if (dwelling) {
          if (elapsed >= DWELL_MS) {
            dwelling = false;
            legStart = now;
          }
        } else {
          progress = Math.min(elapsed / TRAVEL_MS, 1);
          if (progress >= 1) {
            legIndex += 1;
            dwelling = true;
            legStart = now;
            if (legIndex >= run.length - 1) {
              legIndex = 0;
              runIndex = (runIndex + 1) % RUNS.length;
            }
          }
        }
      }

      const activeId = dwelling ? from.id : null;
      const eased = easeInOut(progress);

      // ── edges ──────────────────────────────────────────────────────────────
      for (const [a, b] of EDGES) {
        const p = px(node(a));
        const q = px(node(b));
        const isLive = !reduced && !dwelling && a === from.id && b === to.id;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = isLive ? palette.signal : palette.rule;
        ctx.lineWidth = isLive ? 1.4 : 1;
        ctx.setLineDash(b === "rejected" ? [3, 4] : []);
        ctx.stroke();
        ctx.setLineDash([]);

        // arrowhead
        const angle = Math.atan2(q.y - p.y, q.x - p.x);
        const tipX = q.x - Math.cos(angle) * (r + 5);
        const tipY = q.y - Math.sin(angle) * (r + 5);
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(tipX - Math.cos(angle - 0.42) * 6, tipY - Math.sin(angle - 0.42) * 6);
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(tipX - Math.cos(angle + 0.42) * 6, tipY - Math.sin(angle + 0.42) * 6);
        ctx.strokeStyle = isLive ? palette.signal : palette.rule;
        ctx.stroke();
      }

      // ── nodes ──────────────────────────────────────────────────────────────
      ctx.font = `500 ${fontSize}px var(--font-plex-mono, ui-monospace), ui-monospace, monospace`;
      ctx.textBaseline = "middle";

      for (const n of NODES) {
        const p = px(n);
        const isActive = n.id === activeId;
        const accent = n.id === "rejected" ? palette.stop : palette.signal;

        if (isActive) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, r + 7, 0, Math.PI * 2);
          ctx.fillStyle = accent;
          ctx.globalAlpha = 0.13;
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? accent : palette.bg;
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = isActive ? accent : palette.rule;
        ctx.stroke();

        // terminal states get a second ring — a real convention, not decoration
        if (n.terminal) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, r + 3.5, 0, Math.PI * 2);
          ctx.strokeStyle = isActive ? accent : palette.rule;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        const onRight = n.x > 0.6;
        ctx.textAlign = onRight ? "left" : "center";
        ctx.fillStyle = isActive ? palette.fg : palette.muted;
        const lx = onRight ? p.x + r + 12 : p.x;
        const ly = onRight ? p.y : p.y + r + 16;
        ctx.fillText(n.label, lx, ly);
      }

      // ── token ──────────────────────────────────────────────────────────────
      if (!reduced && !dwelling) {
        const p = px(from);
        const q = px(to);
        const tx = p.x + (q.x - p.x) * eased;
        const ty = p.y + (q.y - p.y) * eased;
        ctx.beginPath();
        ctx.arc(tx, ty, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = to.id === "rejected" ? palette.stop : palette.signal;
        ctx.fill();
      }

      if (!reduced && visible) raf = requestAnimationFrame(draw);
    };

    resize();
    draw(performance.now());

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw(performance.now());
    });
    ro.observe(canvas);

    // Stop burning frames when nobody is looking at it.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        cancelAnimationFrame(raf);
        if (visible && !reduced) {
          legStart = performance.now();
          raf = requestAnimationFrame(draw);
        }
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const themeObserver = new MutationObserver(() => {
      palette = readTokens();
      if (reduced) draw(performance.now());
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      themeObserver.disconnect();
    };
  }, []);

  return (
    <figure className="m-0">
      <canvas
        ref={canvasRef}
        className="block h-[190px] w-full sm:h-[230px]"
        role="img"
        aria-label="Order lifecycle state machine: pending transitions to approved, which transitions to either fulfilled or rejected. Fulfilled and rejected are terminal states."
      />
      <figcaption className="label mt-3 border-t border-rule pt-3">
        Fig. 01 — Order lifecycle, OrderFlow. Double ring denotes a terminal state.
      </figcaption>
    </figure>
  );
}
