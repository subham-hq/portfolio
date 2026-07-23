"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { footerNav, links, nav } from "@/content/site";
import { CommandHint } from "./CommandPalette";
import { Wordmark } from "./Monogram";
import { cx } from "@/lib/utils";
import { LocalClock } from "./LocalClock";
import { ThemeToggle } from "./ThemeToggle";

/**
 * The mobile menu is a full-height sheet, not a dropdown.
 *
 * The previous version rendered seven links directly under the header and
 * relied on the page not being taller than the viewport. Two problems: the
 * primary nav only reaches seven of nineteen routes, so twelve pages were
 * discoverable on mobile *only* by scrolling to the footer; and with body
 * scroll locked, anything past the fold was unreachable.
 *
 * This version exposes every route, scrolls internally, and pins the primary
 * action to the bottom — inside the thumb zone rather than at the top of a
 * 6-inch screen where nobody can reach it one-handed.
 */
export function Header() {
  const pathname = usePathname();
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
    // underneath, which a screen-reader or keyboard user cannot see is there.
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
                  "mono nav-swap tap-area text-micro uppercase tracking-[0.11em] transition-colors",
                  isActive(item.href) ? "text-signal" : "text-fg-faint hover:text-fg",
                )}
              >
                <span className="nav-swap-inner">
                  <span>{item.label}</span>
                  <span aria-hidden="true">{item.label}</span>
                </span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-3">
            <span className="mono hidden text-micro text-fg-faint lg:inline">
              <LocalClock />
            </span>
            <CommandHint />
            <ThemeToggle />
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              className="tap mono -mr-2 inline-flex items-center justify-center text-micro uppercase tracking-[0.11em] text-fg-faint transition-colors hover:text-fg"
            >
              {open ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <div
          ref={sheetRef}
          id="mobile-nav"
          className="fixed inset-x-0 top-14 bottom-0 z-50 flex flex-col border-t border-rule bg-bg"
        >
          <nav
            aria-label="All pages"
            className="shell flex-1 overflow-y-auto overscroll-contain py-6"
          >
            {/* The header nav carries seven routes; the site has nineteen. On
                every breakpoint this sheet is the complete index, so nothing
                is reachable only by scrolling to the footer. */}
            <ul className="md:grid md:grid-cols-2 md:gap-x-12">
              {nav
                .filter((item) => item.href !== "/contact")
                .map((item) => (
                  <li key={item.href} className="border-b border-rule">
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={cx(
                        "font-display flex items-center justify-between py-3.5 text-h3",
                        isActive(item.href) ? "text-signal" : "",
                      )}
                    >
                      {item.label}
                      <span aria-hidden="true" className="mono text-label text-fg-faint">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>

            {/* Every remaining route, so nothing is reachable only by scrolling
                to the footer. Two columns keeps the sheet short enough to scan. */}
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-7 md:grid-cols-4">
              {Object.entries(footerNav).map(([group, items]) => (
                <div key={group}>
                  <p className="label mb-2">{group}</p>
                  <ul>
                    {items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="tap-area block py-2 text-body text-fg-muted"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </nav>

          {/* Pinned to the bottom: the primary action sits in the thumb zone,
              not at the top of the screen where it cannot be reached one-handed. */}
          <div className="shell border-t border-rule py-4">
            <p className="label mb-4">Backend engineer · West Bengal</p>
            <Link
              href="/contact"
              className="mono flex min-h-12 items-center justify-center gap-2 rounded-sm bg-fg px-4 text-label uppercase tracking-[0.11em] text-bg"
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
          </div>
        </div>
      ) : null}
    </header>
  );
}
