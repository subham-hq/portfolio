"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { person } from "@/content/site";

/**
 * First-paint counter.
 *
 * Every reference portfolio that uses one keeps it under a second — the moment
 * a preloader becomes a toll booth it is costing conversions, not building
 * anticipation. So this one:
 *
 *   · runs once per session (sessionStorage), never on repeat navigation
 *   · caps at ~900ms regardless of network
 *   · dismisses on any key press, click or scroll
 *   · does not render at all under prefers-reduced-motion
 *   · never blocks: the page is fully rendered and interactive underneath
 */
export function Preloader() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (reduced) return;
    // Respect Save-Data: someone on a metered connection did not ask for an
    // animated intro before they can read anything.
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    if (connection?.saveData) return;
    try {
      if (sessionStorage.getItem("seen-intro")) return;
      sessionStorage.setItem("seen-intro", "1");
    } catch {
      // Storage blocked. Show it once for this page view rather than never.
    }
    setVisible(true);
  }, [reduced]);

  useEffect(() => {
    if (!visible) return;

    const start = performance.now();
    const DURATION = 900;
    let raf = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / DURATION, 1);
      setCount(Math.round(progress * 100));
      if (progress < 1) raf = requestAnimationFrame(tick);
      else setVisible(false);
    };
    raf = requestAnimationFrame(tick);

    const dismiss = () => setVisible(false);
    window.addEventListener("keydown", dismiss);
    window.addEventListener("pointerdown", dismiss);
    window.addEventListener("wheel", dismiss, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", dismiss);
      window.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("wheel", dismiss);
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          // aria-hidden and pointer-events-none: assistive tech and keyboard
          // users go straight to the content underneath, which is already there.
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[100] flex flex-col justify-between bg-bg p-6"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-display text-[1.05rem] leading-none font-semibold tracking-[-0.035em]">
            {person.name}
          </p>

          <div className="flex items-end justify-between">
            <p className="mono text-label uppercase tracking-[0.11em] text-fg-faint">
              {person.role}
            </p>
            <p className="figure-value tabular-nums text-fg">
              {String(count).padStart(3, "0")}
              <span className="mono ml-1 text-label text-signal">%</span>
            </p>
          </div>

          <div className="absolute inset-x-0 bottom-0 h-px bg-rule">
            <motion.div
              className="h-full bg-signal"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: count / 100 }}
              style={{ transformOrigin: "left" }}
              transition={{ duration: 0.1, ease: "linear" }}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
