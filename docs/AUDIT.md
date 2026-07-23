# Release audit

An independent pass over the repository, taken as a reviewer rather than the
author. Every item below was found and fixed in the codebase, not just noted.

## Defects fixed

### 1. The 3D scene was visibly broken — CRITICAL

`Lattice.tsx` wrote its instance matrices inside `useMemo`. `useMemo` runs
*during render*, before React attaches refs, so `mesh.current` was `null`, the
write silently did nothing, and all 140 instances kept the identity matrix —
every node rendered stacked at the origin.

Fixed by moving the write to `useLayoutEffect`, which runs after commit and
before paint. Same pass also:

- replaced `Math.random()` with a seeded PRNG, so the lattice is deterministic
  rather than different on every mount
- removed dead arithmetic in the pointer handler (`state.pointer` is already
  normalised to −1..1; the multiply-then-divide by viewport width was a no-op)
- clamped `delta` so a backgrounded tab returning does not snap the scene
  through a half turn, and made rotation frame-rate independent
- added disposal for the imperatively-built `BufferGeometry` (R3F only owns
  what it creates from JSX)
- added per-instance vertex colours, so a minority of nodes carry the
  operations accent — the two threads of the story are in the object itself

### 2. Colour system failed WCAG AA in both themes — CRITICAL

`--fg-faint` was `#6f7674` in both themes: **4.25:1** on light, **4.23:1** on
dark. AA for body text is 4.5:1. That token drives every `.label`, `Tag`, and
metadata line on the site — the failure was sitewide, not incidental.

`--color-stop` was a single mid-tone at **3.50:1** on the dark surface. It is
the colour of form validation errors, which is close to the worst possible
place for a contrast failure.

Fixed by splitting every status colour into measured light and dark variants.
The lowest ratio anywhere in the system is now **4.74:1**; most tokens clear
AAA. Verified numerically, not by eye.

### 3. `overflow-x: hidden` on `body` risked breaking the sticky header

Several engines promote a `hidden` overflow on `body` to a scroll container,
which silently disables `position: sticky` on descendants. Changed to
`overflow-x: clip`, which prevents horizontal overflow without that side effect.

### 4. The marquee loop visibly jumped

`.marquee-track` had `gap: 2rem`, so the `translate3d(-50%)` keyframe did not
land on the start of the duplicated track. Spacing moved onto the list items;
the track is now `width: max-content` with no gap, so the seam is exact.

### 5. The 3D scene never stopped rendering

`Hero3D` passed `frameloop="always"` under a comment claiming it paused when
off-screen. It did not — the scene rendered continuously behind every other
section and in backgrounded tabs. `frameloop` is now driven by an
`IntersectionObserver` plus `visibilitychange`. Also added a `deviceMemory < 4`
gate, so low-memory devices get the SVG fallback.

### 6. The section rail overlapped the content at 1280px

The rail was shown from `xl` (1280px). At that width the shell gutter is ~45px
and the rail occupies ~64px — it sat on top of the copy. Moved to `2xl`
(1536px), where the centred shell leaves 96px of margin.

### 7. Three copies of the same repository card

The GitHub repo card markup was duplicated across the index, `/open-source`
and `/github`, and had already drifted between them. Extracted to
`RepoCard` / `RepoGrid`. The project row was duplicated across two routes;
extracted to `ProjectRow`, which also gained an `01 / 05` position counter.

### 8. `/open-source` and `/github` were ~80% the same page

Both listed the repositories. `/github` is now statistics only and links
across. One canonical list that cannot disagree with itself.

### 9. Missing error and loading states

Added `error.tsx` (route boundary, surfaces the digest so a report is
actionable), `global-error.tsx` (inline styles — it replaces the root layout,
so it cannot assume the design system loaded), and `loading.tsx` (a skeleton
matching the page rhythm, not a spinner).

### 10. No icons, no redirects, no CSP

Added generated `icon.tsx` and `apple-icon.tsx`. Added permanent redirects for
every route renamed during development (`/work`, `/credentials`, `/stack`,
`/skills`, `/cv`) so no shared link breaks. Added a Content-Security-Policy and
HSTS, with the `'unsafe-inline'` script exception documented rather than left
implicit.

### 11. Content and consistency

- `figures` claimed "2030 / BSc", which parses as neither a number nor a unit.
  Replaced with a checkable figure.
- The `now` block was rendered by zipping an array of objects against a
  positional array of labels — silently wrong if either changed. Restructured
  so each entry carries its own key.
- Three GitHub chart URLs hard-coded `1f8f86`, which is not the signal token
  (`0f7a72`). Aligned.
- `Preloader` now respects `Save-Data`.

## Verified, no change needed

- Heading hierarchy: exactly one `h1` per route, no skipped levels.
- `noUncheckedIndexedAccess` is on and clean; no `any`, no non-null assertions
  outside provably-safe tuple access.
- Every animation checks `prefers-reduced-motion` and degrades to a static
  render.
- Skip link, visible focus ring, `aria-current` on nav, `aria-expanded` /
  `aria-controls` on the FAQ, `role="alert"` on form errors.
- No `localStorage` write is unguarded; every one is in a `try`.
- GitHub fetch has a timeout, hourly revalidation, and a committed fallback.

## Mobile pass

Measured, not eyeballed. Numbers below are computed from the actual clamp
values and padding in the stylesheet.

### Touch targets — four of eight controls failed

| Control | Before | After |
| --- | --- | --- |
| `Button` (every CTA on the site) | 36.0px | 44.0px |
| Theme toggle | 15.4px | 44.0px |
| Menu button | 15.4px | 44.0px |
| Header logo | 16.8px | 44.0px |
| Footer nav link | 25.6px | 52.8px |

Fixed with a `.tap` utility (44×44 minimum) and a `.tap-area` variant that
expands the hit box via a pseudo-element where a 44px box would wreck the
typographic rhythm of a dense list. Applied as utilities rather than
per-component so a new control cannot be added without one.

### The hero pushed the headline off an iPhone SE

The 3D scene was first in DOM order on every breakpoint, so a 280px graphic sat
above the `h1`. Combined with a 2.6rem `h1` floor, the headline ran to five
lines and the first call to action landed near 600px on a 667px viewport.

Mobile order is now heading → lede → actions → graphic, restored to side-by-side
at `lg`. The `h1` floor dropped to 2.05rem — three lines instead of five, with
the desktop scale unchanged. The headline now ends at ~259px and the first CTA
sits at ~283px, comfortably in the thumb zone.

Roughly 459px of vertical space was reclaimed above the second fold:

| Change | Saved |
| --- | --- |
| Hero graphic 280px → 190px | 90px |
| Figures restacked as value-beside-label | 180px |
| Band spacing floor 4rem → 3rem, across nine bands | 144px |
| `h1` floor reduction | ~45px |

### The mobile menu reached seven of nineteen routes

It was a dropdown under the header holding only the primary nav; the other
twelve pages were discoverable on a phone *only* by scrolling to the footer.
With body scroll locked, anything past the fold was unreachable.

Now a full-height sheet: every route in two tiers, internal scroll with
`overscroll-contain`, a focus trap, Escape-to-close returning focus to the
toggle, and the primary action pinned to the bottom — in the thumb zone rather
than at the top of a 6-inch screen.

### Other mobile and cross-browser fixes

- `70vh` → `dvh` on the error and 404 screens. iOS Safari's `vh` excludes the
  collapsing toolbar, so those pages overflowed on first paint.
- Every `:hover` effect scoped to `@media (hover: hover) and (pointer: fine)`.
  On touch, `:hover` latches after a tap — the marquee froze permanently and
  card lifts stuck.
- `-webkit-tap-highlight-color: transparent` on all interactive elements; the
  default iOS blue flash fought every focus treatment in the system.
- `interactiveWidget: "resizes-content"` so the on-screen keyboard does not
  shift fixed elements mid-form. Form inputs held at 16px, below which iOS
  Safari zooms the viewport on focus.
- `overflow-wrap: break-word` on text elements — long repository names and URLs
  were the remaining horizontal-overflow risk at 320px.
- `overscroll-behavior-y: none` to stop page-level rubber-banding when a nested
  scroller hits its end.
- `@supports` fallbacks for `backdrop-filter` (Safari prefix, Firefox flag),
  `mask-image`, and `overflow: clip` (Safari < 16).
- Third-party stat SVGs on `/github` keep a 380px minimum inside a scroll
  region rather than being squashed below legibility.
- Header shows the monogram below 400px, full name above.

### One more 3D bug, introduced in the previous pass

Per-instance colours were attached as a geometry `color` attribute with
`vertexColors`. The geometry is shared across instances, so that applies one
colour to all of them — and the attribute length did not match the icosahedron
vertex count. Replaced with `setColorAt` writing to `instanceColor`, which is
the correct mechanism.

## Final pass — CSS containing-block bugs

Two `position: fixed` elements were anchored to the wrong box. Both would have
been visible immediately in a browser and neither is catchable by TypeScript,
ESLint or a build.

**The mobile menu sheet.** It was `fixed inset-x-0 top-14 bottom-0` inside a
`<header>` carrying `backdrop-blur-md`. A non-`none` `backdrop-filter` creates a
containing block for fixed descendants, exactly as `transform` does — so
`top-14 bottom-0` resolved against the 56px header box rather than the viewport,
and the sheet rendered as a sliver. The blur moved to an inner bar; `sticky`
alone does not create a containing block, so the `<header>` wrapper is safe.

**The section rail.** It was rendered inside the page tree, which is wrapped in
`PageTransition` — a `motion.div` that carries a transform. Same rule: the rail
anchored to the animated wrapper instead of the viewport and would have drifted
on every route change. It is now portaled to `document.body`, which makes it
immune to whatever any future ancestor does.

Also verified in this pass, no change needed: no dead components, no unused
utilities, every dependency imported somewhere, no `console.log`, no raw `vh`,
no unscoped `:hover`, no unguarded `localStorage`.

## Post-release fix — CSP broke the dev server

Found by running `next dev`, which the audit passes never did — they only ran
`next build`. That gap is the lesson: a passing production build says nothing
about development, and the two environments have genuinely different needs.

**Symptom.** The page rendered as unstyled server HTML — default serif, blue
underlined links, both copies of the hover-swap nav text visible — while the
terminal reported a completely clean compile and `GET / 200`.

**Cause.** `next dev` compiles with `eval()` for hot module replacement, and in
development it injects stylesheets *through JavaScript* rather than a `<link>`
tag. The Content-Security-Policy specified `script-src 'self' 'unsafe-inline'`
with no `'unsafe-eval'`, so the dev client bundle was blocked outright. No
bundle meant no CSS injection and no hydration. Production was unaffected,
because it ships a real `<link>` and does not use `eval` — which is exactly why
`next build` passed every time.

**Fix.** The policy is now environment-aware. Development adds `'unsafe-eval'`
and `ws: wss:` for the HMR socket. Production is unchanged and still strict —
verified by serving both and reading the headers back:

| | dev | production |
| --- | --- | --- |
| `'unsafe-eval'` | present | **absent** |
| `ws: wss:` in `connect-src` | present | absent |
| `upgrade-insecure-requests` | absent | present |
| HSTS | absent | present |

`Strict-Transport-Security` is also now development-only-excluded. Sending HSTS
from localhost pins *every* localhost project on the machine to https for two
years, and it is browser-persistent and awkward to undo.

## Post-release fix — floating-point hydration mismatch

The last remaining hydration error, and the most subtle one in the project.

```
server  cx="64.79440949762451"
client  cx={64.79440949762453}
```

`LatticeFallback` in Hero3D.tsx generated its SVG node coordinates at render
time with `Math.cos` and `Math.sin`. ECMAScript does not require transcendental
functions to be bit-identical across implementations — only correctly rounded
to within an implementation-defined tolerance. V8 (the Node server) and
JavaScriptCore (Safari) therefore returned values differing by one unit in the
last place. React compares the serialised attribute string, so a difference in
the 15th significant digit is a mismatch: it discards the server HTML and
re-renders the tree.

This is invisible on Chrome, because Chrome and Node share V8. It only appears
in Safari or Firefox, which is precisely the kind of bug that ships.

Fixed by replacing the generator with a literal table of coordinates. Rounding
would have made a collision improbable; a literal makes it impossible, and
costs nothing because the fallback layout never changes.

Swept the rest of the codebase for the same pattern. The only other uses of
transcendental math are in `Lattice.tsx` (dynamically imported with
`ssr: false`, so never server-rendered) and `StateMachine.tsx` (canvas drawing
inside an effect, which produces no SSR attributes). Neither can mismatch.

## Known limitations — stated, not hidden

- **Lighthouse Performance will not be 100 on the index.** The 3D chunk is
  ~90 kB gzipped. It is lazy, gated, and absent on mobile, so the mobile score
  is unaffected — but on a desktop run it costs a few points. That is the
  trade for having it at all, and it is a deliberate choice, not an oversight.
- **CSP uses `'unsafe-inline'` for scripts.** A nonce requires middleware on
  every request, which converts static pages into dynamic ones. For a site with
  no auth, no user data and no third-party script surface, that cost is not
  justified. Documented in `next.config.ts`.
- **Third-party stat cards on `/github`** are rendered by external services. If
  one is down, its panel is empty; nothing else is affected.
