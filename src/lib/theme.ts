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

/**
 * Sweep timing. Both were measured rather than guessed.
 *
 * The easing is the shape of the *edge velocity*, and it matters more than the
 * duration. An earlier version used ease-out-cubic, which completes 58% of the
 * travel in the first quarter of the duration and 87% by halfway — so the last
 * half covers 13% of the distance and the edge visibly crawls to a stop. That
 * is what read as "not smooth".
 *
 * cubic-bezier(0.4, 0, 0.2, 1) spreads the same distance far more evenly —
 * 24% at a quarter, 78% at halfway — and has a *lower* peak speed despite
 * running longer, so it neither jolts at the start nor stalls at the end.
 *
 * 900ms is long enough for the sweep to register as a deliberate event rather
 * than a transition artefact, and short enough that toggling twice in a row
 * does not feel like waiting.
 */
const SWEEP_MS = 900;
const SWEEP_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";

/** Where the sweep originates, in viewport coordinates. */
export interface Origin {
  x: number;
  y: number;
}

/**
 * Not declared globally on `Document`.
 *
 * `startViewTransition` landed in lib.dom at different times across TypeScript
 * releases, so a global augmentation either conflicts with the built-in
 * definition or does not, depending on which version is installed. A local
 * structural cast is version-proof and scoped to the one place that needs it.
 */
type WithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => {
    ready: Promise<void>;
    finished: Promise<void>;
  };
};

/** Commit the theme. Deliberately synchronous and side-effect-only, because
 *  the View Transitions API calls it between capturing the two snapshots. */
function commit(next: Theme): void {
  document.documentElement.setAttribute("data-theme", next);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLOR[next]);
}

/**
 * Apply a theme: set the attribute, persist the choice, keep the browser chrome
 * in step, and — when an origin is given — sweep the new theme in from that
 * point rather than cutting to it.
 *
 * The sweep uses the View Transitions API. The browser snapshots the page
 * before and after the change, and CSS then clips the *new* snapshot with a
 * circle expanding from the origin. Nothing on the page is re-rendered or
 * animated by JavaScript: it is two static layers and one clip-path, which is
 * why it stays smooth over a full-viewport canvas and a WebGL scene.
 *
 * It falls back to an instant change, with no visual difference from the
 * previous behaviour, when:
 *   · the browser has no View Transitions support
 *   · prefers-reduced-motion is set — a 700ms full-screen wipe is exactly the
 *     kind of motion that preference exists to prevent
 *   · no origin was supplied, so there is nowhere sensible to sweep from
 *
 * The preference is written to storage before any of that, so a transition that
 * is skipped or interrupted can never lose the choice.
 */
export function applyTheme(next: Theme, origin?: Origin): void {
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Private mode or blocked storage. The theme still changes for this
    // session; it simply will not be remembered.
  }

  const root = document.documentElement;
  const start = (document as WithViewTransition).startViewTransition;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!start || reduced || !origin) {
    commit(next);
    return;
  }

  // Radius needed to cover the whole viewport from this origin: the distance
  // to whichever corner is furthest away. Anything smaller leaves a corner of
  // the old theme behind at the end of the sweep.
  const radius = Math.hypot(
    Math.max(origin.x, window.innerWidth - origin.x),
    Math.max(origin.y, window.innerHeight - origin.y),
  );

  // Scopes the CSS that disables the browser's default cross-fade, so it
  // cannot capture any other view transition added to the site later.
  root.setAttribute("data-theme-sweep", "");

  const transition = start.call(document, () => commit(next));

  /**
   * The animation is driven here rather than from CSS keyframes, and that is
   * the fix for why the first version of this did nothing.
   *
   * The CSS version read `animation: theme-sweep 720ms var(--ease-out-expo)`.
   * View transition pseudo-elements live in their own tree and do not reliably
   * inherit custom properties from :root — and a `var()` that fails to resolve
   * inside a *shorthand* invalidates the whole declaration at computed-value
   * time. It did not fall back to the previous value; it computed to
   * `animation: none`. The sweep never ran, while the browser still held the
   * frame for the default group animation. The result was a change followed by
   * a short freeze, which reads as sluggish rather than smooth.
   *
   * Passing literal numbers to the Web Animations API removes every custom
   * property from the path. There is nothing left to fail to resolve.
   *
   * `transition.ready` matters: the pseudo-elements do not exist until it
   * settles, so animating before that silently targets nothing.
   */
  transition.ready
    .then(() => {
      // Shared so the two layers cannot drift apart by a frame.
      const timing: KeyframeAnimationOptions = {
        duration: SWEEP_MS,
        easing: SWEEP_EASING,
      };

      // The new theme is revealed by a circle growing out of the switch.
      root.animate(
        {
          clipPath: [
            `circle(0px at ${origin.x}px ${origin.y}px)`,
            `circle(${radius}px at ${origin.x}px ${origin.y}px)`,
          ],
        },
        { ...timing, pseudoElement: "::view-transition-new(root)" },
      );

      // The outgoing theme is pushed gently outward from the same point, so
      // the two layers separate instead of one flatly replacing the other.
      // 8% over the full duration is barely perceptible in isolation and is
      // most of what stops this reading as a wipe.
      //
      // transformOrigin is passed as a keyframe with the same value at both
      // ends rather than set in CSS. It cannot come from a custom property:
      // view transition pseudo-elements do not reliably inherit them, which is
      // the exact trap that stopped the first version of this working at all.
      root.animate(
        {
          transform: ["scale(1)", "scale(1.08)"],
          transformOrigin: [`${origin.x}px ${origin.y}px`, `${origin.x}px ${origin.y}px`],
        },
        { ...timing, pseudoElement: "::view-transition-old(root)" },
      );
    })
    .catch(() => {
      // The transition was skipped — another one started, or the tab was
      // hidden. The theme has already been committed either way.
    });

  transition.finished
    .catch(() => {})
    .finally(() => root.removeAttribute("data-theme-sweep"));
}

export function toggleTheme(origin?: Origin): Theme {
  const next: Theme = readTheme() === "dark" ? "light" : "dark";
  applyTheme(next, origin);
  return next;
}

/**
 * Viewport centre of the header toggle, so a theme change triggered from the
 * ⌘K palette still sweeps out of the switch rather than from nowhere. Falls
 * back to the centre of the screen if the control is not on the page.
 */
export function toggleOrigin(): Origin {
  const button = document.querySelector("[data-theme-toggle]");
  if (button) {
    const rect = button.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
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
