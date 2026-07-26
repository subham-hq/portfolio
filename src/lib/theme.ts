/**
 * THEME
 *
 * One place that owns the theme, because three separate things change it: the
 * pre-paint bootstrap in layout.tsx, the header toggle, and the ⌘K palette.
 * They previously each set `data-theme` by hand, which is how the header label
 * ended up disagreeing with the actual theme after a palette toggle.
 *
 * Dark is the default. Light is only ever applied when the visitor has
 * explicitly chosen it and that choice is still in storage — the OS preference
 * is deliberately not consulted. The site is designed dark first: the
 * starfield, the vignette and the lattice all assume it, and a visitor whose
 * laptop happens to be in light mode should still see the site as intended
 * until they say otherwise.
 */

export type Theme = "light" | "dark";

export const STORAGE_KEY = "theme";

/** Must match --bg in globals.css for each theme. These drive the browser
 *  chrome colour on mobile, so a mismatch shows as a coloured band above the
 *  page on iOS Safari. */
export const THEME_COLOR: Record<Theme, string> = {
  light: "#f4f5f3",
  dark: "#080c0c",
};

/** The live theme, read from the DOM rather than from storage — the attribute
 *  is the truth, and storage may hold nothing at all. */
export function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

/** Apply a theme: set the attribute, persist the choice, and keep the browser
 *  chrome in step. Every writer should go through here. */
export function applyTheme(next: Theme): void {
  document.documentElement.setAttribute("data-theme", next);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLOR[next]);

  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Private mode or blocked storage. The theme still changes for this
    // session; it simply will not be remembered.
  }
}

export function toggleTheme(): Theme {
  const next: Theme = readTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}

/**
 * Watch for theme changes from anywhere and call back with the new value.
 * A MutationObserver rather than an event, so it catches any writer — including
 * one added later that forgets to announce itself.
 */
export function watchTheme(onChange: (theme: Theme) => void): () => void {
  const observer = new MutationObserver(() => onChange(readTheme()));
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}
