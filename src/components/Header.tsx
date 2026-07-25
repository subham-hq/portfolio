"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { footerNav, links, nav } from "@/content/site";
import { cx } from "@/lib/utils";
import { AmbientAudio } from "./AmbientAudio";
import { CommandHint } from "./CommandPalette";
import { LocalClock } from "./LocalClock";
import { Wordmark } from "./Monogram";
import { ThemeToggle } from "./ThemeToggle";

/**
 * The menu is a full-height sheet, not a dropdown, on every breakpoint.
 *
 * The header nav carries seven routes; the site has nineteen. This sheet is
 * the complete index, so nothing is reachable only by scrolling to the footer.
 *
 * It used to appear and disappear instantly — `{open ? <div/> : null}` with no
 * transition, which is what made it feel sharp and cheap next to the rest of
 * the page. It now wipes open from the top and staggers its rows in. The
 * timings are deliberately slower than feels necessary on the first viewing:
 * an interface that resolves rather than snaps is most of what separates an
 * expensive-feeling site from a fast one.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

export function Header() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;

    const { body } = document;
    const previous = body.style.overflow;
    body.style.overflow = "hidden";

    // Escape closes and returns focus to the control that opened it.
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };

    // Focus trap. Without it, tabbing from an open sheet walks into the page
    // underneath, which a keyboard or screen-reader user cannot see is there.
    const onTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !sheetRef.current) return;
      const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])",
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("keydown", onTab);

    return () => {
      body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("keydown", onTab);
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const primary = nav.filter((item) => item.href !== "/contact");

  /** Rows lift out of a mask, staggered, once the sheet itself has opened. */
  const row = {
    hidden: { y: reduced ? 0 : "110%" },
    shown: { y: 0 },
  };

  return (
    <header className="no-print sticky top-0 z-50">
      <div className="border-b border-rule bg-bg/85 backdrop-blur-md">
        <div className="shell flex h-14 items-center justify-between gap-4">
          <Wordmark />

          <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cx(
                  "mono tap-area flex items-center text-micro uppercase tracking-[0.11em] transition-colors",
                  isActive(item.href) ? "text-signal" : "text-fg-faint hover:text-fg",
                )}
              >
                <span className="nav-swap">
                  <span className="nav-swap-inner">
                    <span>{item.label}</span>
                    <span aria-hidden="true">{item.label}</span>
                  </span>
                </span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-3">
            <span className="mono hidden text-micro text-fg-faint lg:inline">
              <LocalClock />
            </span>
            <CommandHint />
            <AmbientAudio />
            <ThemeToggle />
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="site-menu"
              className="tap mono -mr-2 inline-flex items-center justify-center text-micro uppercase tracking-[0.11em] text-fg-faint transition-colors hover:text-fg"
            >
              {open ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            ref={sheetRef}
            id="site-menu"
            // clipPath wipes the panel open from the top edge rather than
            // sliding a solid block over the page. It reads as the sheet being
            // revealed, and it composites, so nothing reflows during the wipe.
            initial={reduced ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
            animate={reduced ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" }}
            exit={reduced ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: reduced ? 0.15 : 0.62, ease: EASE }}
            className="fixed inset-x-0 top-14 bottom-0 z-50 flex flex-col border-t border-rule bg-bg"
          >
            <motion.nav
              aria-label="All pages"
              className="shell flex-1 overflow-y-auto overscroll-contain py-6"
              initial="hidden"
              animate="shown"
              transition={{ staggerChildren: 0.045, delayChildren: 0.16 }}
            >
              <ul className="md:grid md:grid-cols-2 md:gap-x-12">
                {primary.map((item) => (
                  <li key={item.href} className="overflow-hidden border-b border-rule">
                    <motion.span
                      variants={row}
                      transition={{ duration: 0.6, ease: EASE }}
                    >
                      <Link
                        href={item.href}
                        aria-current={isActive(item.href) ? "page" : undefined}
                        className={cx(
                          "font-display group flex items-center justify-between py-3.5 text-h3 transition-colors",
                          isActive(item.href) ? "text-signal" : "hover:text-signal",
                        )}
                      >
                        {item.label}
                        <span
                          aria-hidden="true"
                          className="mono text-label text-fg-faint transition-transform duration-500 group-hover:translate-x-1"
                        >
                          →
                        </span>
                      </Link>
                    </motion.span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-7 md:grid-cols-4">
                {Object.entries(footerNav).map(([group, items]) => (
                  <motion.div
                    key={group}
                    variants={{
                      hidden: { opacity: 0, y: reduced ? 0 : 10 },
                      shown: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.55, ease: EASE }}
                  >
                    <p className="label mb-2">{group}</p>
                    <ul>
                      {items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className="tap-area block py-2 text-body text-fg-muted transition-colors hover:text-fg"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </motion.nav>

            {/* Pinned to the bottom: the primary action sits in the thumb zone,
                not at the top of the screen where it cannot be reached
                one-handed. */}
            <motion.div
              className="shell border-t border-rule py-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: reduced ? 0 : 0.3, ease: EASE }}
            >
              <p className="label mb-4">Backend engineer · West Bengal</p>
              <Link
                href="/contact"
                className="mono flex min-h-12 items-center justify-center gap-2 rounded-sm bg-fg px-4 text-label uppercase tracking-[0.11em] text-bg transition-opacity hover:opacity-85"
              >
                Get in touch <span aria-hidden="true">→</span>
              </Link>
              <p className="label mt-3 flex items-center justify-center gap-2">
                <LocalClock />
                <span aria-hidden="true">·</span>
                <a href={links.github} className="hover:text-fg">
                  GitHub
                </a>
                <span aria-hidden="true">·</span>
                <a href={links.linkedin} className="hover:text-fg">
                  LinkedIn
                </a>
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
