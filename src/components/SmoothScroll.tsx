"use client";

import { useEffect } from "react";

/**
 * SMOOTH SCROLL
 *
 * Wheel input is captured and the page is eased toward a target position
 * instead of jumping by the raw delta. This is what gives reference sites
 * their weighted, expensive feel — the page has momentum rather than
 * teleporting.
 *
 * Written rather than pulled from a library, for one reason that matters: it
 * drives the *real* window scroll position via `window.scrollTo`. Libraries
 * that translate a wrapper element instead will break `position: sticky` on
 * the header, every IntersectionObserver on the page (the section rail, all
 * the reveals), and the scroll-progress bar. Everything here keeps working
 * because the browser's own scroll position is still the source of truth.
 *
 * Deliberately inert on:
 *   · touch devices — native momentum is better than anything reimplemented,
 *     and hijacking it on mobile is the classic way to make a site feel broken
 *   · prefers-reduced-motion
 *   · anything scrolling inside a nested scroller (the command palette list,
 *     the mobile menu sheet, the contribution graph strip)
 */

/** Walk up from the event target looking for an ancestor that scrolls itself.
 *  If one is found the wheel event belongs to it, not to the page. */
function insideNestedScroller(target: EventTarget | null): boolean {
  let node = target instanceof Element ? target : null;

  while (node && node !== document.body && node !== document.documentElement) {
    const style = getComputedStyle(node);
    const scrollsY = /(auto|scroll|overlay)/.test(style.overflowY);
    if (scrollsY && node.scrollHeight > node.clientHeight + 1) return true;
    node = node.parentElement;
  }
  return false;
}

export function SmoothScroll() {
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || still.matches) return;

    const root = document.documentElement;

    // CSS `scroll-behavior: smooth` would fight the lerp: the browser would
    // animate toward each intermediate position we set. Anchor links are
    // handled below instead.
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";

    let target = window.scrollY;
    let current = window.scrollY;
    let running = false;
    let raf = 0;

    const limit = () => Math.max(0, root.scrollHeight - window.innerHeight);

    const loop = () => {
      // 0.11 is the feel. Lower drags, higher approaches a hard jump.
      current += (target - current) * 0.11;

      if (Math.abs(target - current) < 0.35) {
        current = target;
        running = false;
        window.scrollTo(0, current);
        return;
      }

      window.scrollTo(0, current);
      raf = requestAnimationFrame(loop);
    };

    const run = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };

    const onWheel = (event: WheelEvent) => {
      // Pinch-zoom and browser zoom must pass straight through.
      if (event.ctrlKey || event.metaKey) return;
      if (insideNestedScroller(event.target)) return;

      event.preventDefault();
      target = Math.min(Math.max(target + event.deltaY, 0), limit());
      run();
    };

    // Any scroll we did not drive — keyboard, scrollbar drag, find-in-page,
    // the back-to-top button — resets the target so the next wheel event
    // continues from where the page actually is.
    const onScroll = () => {
      if (!running) {
        target = window.scrollY;
        current = window.scrollY;
      }
    };

    // Anchor links, since CSS smooth scrolling is now off. Eases to the
    // section using the same loop, so in-page jumps feel identical to wheeling.
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest?.(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null;
      if (!anchor) return;

      const id = anchor.getAttribute("href")?.slice(1);
      if (!id) return;

      const section = document.getElementById(id);
      if (!section) return;

      event.preventDefault();
      // Matches scroll-padding-top: clears the sticky header.
      const offset = 80;
      target = Math.min(
        Math.max(section.getBoundingClientRect().top + window.scrollY - offset, 0),
        limit(),
      );
      run();
      history.replaceState(null, "", `#${id}`);
    };

    const onResize = () => {
      target = Math.min(target, limit());
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      root.style.scrollBehavior = previousBehavior;
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
