"use client";

import { useEffect, useState } from "react";
import { readTheme, toggleTheme, watchTheme, type Theme } from "@/lib/theme";

export function ThemeToggle() {
  // Matches the bootstrap default, so the first paint and the first render
  // agree and there is nothing to mismatch during hydration.
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(readTheme());
    // The ⌘K palette can also change the theme. Watching the attribute rather
    // than owning the state means this label can never disagree with the page
    // — which it did: a palette toggle left the button reading the old value,
    // and its next click then flipped to the wrong one.
    return watchTheme(setTheme);
  }, []);

  const toggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    // Keyboard activation (Enter or Space) fires a click with clientX/clientY
    // of 0, which would sweep from the top-left corner. Falling back to the
    // control's own centre means the effect starts at the switch either way.
    const x = event.clientX || rect.left + rect.width / 2;
    const y = event.clientY || rect.top + rect.height / 2;
    setTheme(toggleTheme({ x, y }));
  };

  return (
    <button
      type="button"
      // Read by toggleOrigin() so a ⌘K theme change sweeps from here too.
      data-theme-toggle=""
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="tap mono inline-flex items-center justify-center text-micro tracking-[0.11em] uppercase text-fg-faint transition-colors hover:text-fg"
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
