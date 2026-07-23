"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { sections } from "@/content/site";

/**
 * Numbered scroll-spy rail, fixed to the left edge on wide viewports.
 *
 * The numbering earns its place: these sections are a deliberate reading order,
 * not an arbitrary list, and the rail tells a visitor both where they are and
 * how much is left.
 *
 * Shown from 1536px only. At 1280px the shell gutter is ~45px and the rail
 * occupies ~64px, so the two overlapped — the rail sat on top of the copy.
 *
 * Rendered through a portal to <body>. The page content is wrapped in
 * `PageTransition`, a motion.div that carries a `transform`, and any non-none
 * transform creates a containing block for `position: fixed` descendants. Left
 * inside that subtree the rail would anchor to the animated wrapper rather than
 * the viewport and drift on every route change. The portal makes it immune to
 * whatever any future ancestor does.
 */
export function SectionRail() {
  const [active, setActive] = useState<string>(sections[0].id);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );

    for (const section of sections) {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);

  if (!mounted) return null;

  return createPortal(
    <nav
      aria-label="Page sections"
      className="no-print fixed top-1/2 left-6 z-40 hidden -translate-y-1/2 2xl:block"
    >
      <ol className="space-y-2.5">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              data-active={active === section.id}
              aria-current={active === section.id ? "true" : undefined}
              className="rail-link mono group flex items-center gap-3 py-1 text-micro text-fg-faint transition-colors hover:text-fg"
            >
              <span className="rail-tick h-px w-3 bg-rule-strong transition-all duration-500 group-hover:w-6" />
              <span className="tabular-nums">{section.num}</span>
              <span className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {section.label}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>,
    document.body,
  );
}
