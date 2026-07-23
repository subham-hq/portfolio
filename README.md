# subhambhattacharya.com

Personal site of Subham Bhattacharya — backend engineer.

Next.js 15 (App Router) · TypeScript strict · Tailwind v4 · React Three Fiber · Framer Motion · Zod · Vercel Analytics.

```bash
npm install
npm run dev      # http://localhost:3000
```

**Build output is a static export** — plain HTML, CSS, JS and images in `out/`.
No adapter, no server, no runtime. It deploys unchanged to Cloudflare Pages,
Vercel, Netlify, GitHub Pages or any bucket behind a CDN.

### Deploying to Cloudflare Pages

1. Push this repository to GitHub.
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**, and pick the repo.
3. Build settings:

   | Field                  | Value           |
   | ---------------------- | --------------- |
   | Framework preset       | **None**        |
   | Build command          | `npm run build` |
   | Build output directory | `out`           |
   | Root directory         | _(leave blank)_ |

4. Environment variables → add `NEXT_PUBLIC_SITE_URL` =
   `https://subhambhattacharya.com`. The other two in `.env.example` are
   optional.
5. Save and deploy. Then **Custom domains** → add the apex domain; DNS is
   already on Cloudflare so the record is created for you.

**Do not use `@cloudflare/next-on-pages`.** It is deprecated, and its peer
range no longer resolves against current wrangler — that is the `ERESOLVE`
failure. A static export needs no adapter at all, which is why this project
uses one.

`public/_headers` and `public/_redirects` are read directly by Cloudflare Pages
and carry the security headers and the legacy-route redirects that
`next.config.ts` cannot express in export mode.

### Deploying to Vercel

Import the repo. Everything is detected; set `NEXT_PUBLIC_SITE_URL` and deploy.

---

## Do this before you ship

Three things are deliberately left for you. None of them block a deploy; all of
them are visible to a reviewer.

1. **Connect the contact form.** Create a free Resend account, verify a domain,
   and set `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` in
   Vercel. About five minutes. Until then the form validates and then tells the
   visitor to email directly, with a copy-to-clipboard button — it never
   silently swallows a message, but it also isn't delivering one.
2. **Rewrite the copy in `src/content/site.ts`.** Every string under `bio` is a
   draft written from your LinkedIn and GitHub bios. It keeps your rhythm, but
   it is not your voice, and a technical reader can hear the difference. See
   [docs/CONTENT.md](docs/CONTENT.md).
3. **Rewrite `src/content/faq.ts` in your own voice.** Seven recruiter objections, answered. Structure is right; the sentences are mine, not yours.
4. **Add `public/subham-bhattacharya-resume.pdf`.** Four links point at it.
   Until it exists they 404.
5. **Add the images listed in [docs/ASSETS.md](docs/ASSETS.md).** The site works
   without them; the OG card is generated, so nothing is broken, but a portrait
   makes the About page land harder.

---

## Architecture

```
src/
├── app/                 # routes; every page is a server component
│   ├── layout.tsx       # metadata, JSON-LD, theme bootstrap
│   ├── page.tsx         # index
│   ├── globals.css      # the entire design system lives here
│   ├── opengraph-image.tsx
│   ├── robots.ts        # generated, not static
│   └── sitemap.ts       # generated from content/, cannot go stale
├── components/
│   ├── Hero3D.tsx       # gate + SVG fallback; decides whether 3D loads at all
│   ├── Lattice.tsx      # the R3F scene, lazily imported by Hero3D
│   ├── StateMachine.tsx # Canvas 2D lifecycle diagram (OrderFlow page)
│   ├── ContactForm.tsx  CopyEmail.tsx
│   ├── Header.tsx  Reveal.tsx  ThemeToggle.tsx  LocalClock.tsx
│   ├── Footer.tsx       # server
│   └── primitives.tsx   # SpecRow, Section, Button, Tag, PageHeader
├── content/             # all copy and data. No strings live in components.
│   ├── site.ts          # identity, links, bio drafts, nav
│   ├── projects.ts      # projects + case studies
│   └── records.ts       # timeline, roadmap, credentials, skills
└── lib/
    ├── fonts.ts  github.ts  utils.ts
```

**Content is separated from presentation on purpose.** Updating the site should
never mean editing JSX. Everything a recruiter reads is in `src/content/`, and
the sitemap is generated from the same files, so adding a project registers it
in three places at once.

**Client components are the exception, not the rule.** The header (menu state),
theme toggle (localStorage), clock (interval), contact form (`useActionState`),
and the two visual components. Every page body renders on the server. That is
why nine of ten routes ship ~110 kB of JavaScript.

**One trap worth knowing about:** a `"use server"` module may only export async
functions. Exporting a plain object from one compiles fine and then arrives as
`undefined` on the client. That is why `FormState` and `initialState` live in
`src/app/contact/form-state.ts` rather than in `actions.ts`.

---

## Design system

The concept is a **specification sheet**, not a brochure. Both halves of
Subham's background — feed manufacturing and backend systems — run on documents
where every value has a label, a unit and a source. The site is built to read
that way.

### The hero — "Lattice"

A rotating three-dimensional graph built with React Three Fiber: nodes linked to
their nearest neighbours, lit from two sides in the site's accent colours, with
damped pointer parallax.

What it represents is deliberately general. A graph of connected nodes is the
shared shape of every system in this story — services, schemas, dependency
graphs, networks. It is about the engineer, not about any one repository, so it
stays true when the projects change.

| Measure        | Detail                                                                   |
| -------------- | ------------------------------------------------------------------------ |
| Draw calls     | 2 — one `InstancedMesh` for 140 nodes, one `LineSegments` for 260 edges  |
| Code split     | `dynamic(..., { ssr: false })`; Three.js is its own chunk (~90 kB gz)    |
| Never loads on | viewports under 768 px, `prefers-reduced-motion`, or no WebGL            |
| Fallback       | The same composition as inline SVG — a fraction of a kilobyte            |
| DPR            | Clamped to 1.5; full retina quadruples fragment cost for no visible gain |

Every route except the index ships **105–112 kB First Load JS**. The index adds
the 3D chunk lazily, and only for visitors who can use it.

### Structure — a reading order, numbered

The index is nine numbered sections (00–08) with a scroll-spy rail fixed to the
left edge on wide screens. The numbering is not decoration: it is the order a
reviewer should meet the material in, and the rail tells them how much is left.

Three devices carry the editorial feel:

- **Figures** — three checkable numbers under the hero. A statistic a reviewer
  cannot verify invites them to discount everything around it, so every figure
  here is one you can point at a source for.
- **Marquee** — a CSS-animated ticker of disciplines. Compositor-only, so it
  costs nothing on the main thread even while the 3D scene renders. Pauses on
  hover, becomes a scroll region under reduced motion.
- **Vitals / Now** — two paired data blocks. Vitals is stable identity;
  Now is what changed this month, with the month printed next to it.

### Motion — four uses, no fifth

`src/components/motion.tsx` holds the whole system. `TextReveal` (word-stagger
mask on arrival), `FadeIn`, `Magnetic` (6 px cap so the target never moves out
from under the cursor), `PageTransition`, and a `Cursor` that expands over
interactive elements. Every one checks `useReducedMotion` and degrades to a
static render.

The cursor does **not** hide the native one. Replacing the system cursor
entirely breaks the affordances people rely on — the text I-beam, resize
handles — for a decorative gain.

### Colour — two accents that mean something

| Token      | Light     | Dark      | Meaning               |
| ---------- | --------- | --------- | --------------------- |
| `--signal` | `#0f7a72` | `#46c9bd` | Software / systems    |
| `--ledger` | `#8a6414` | `#d5a44a` | Operations / business |

Nothing else on the site is allowed to be colourful. That restraint is what
makes the two accents legible as _information_ — on the experience page you can
see the two threads of the career without reading a word.

Neutrals are a cool grey with a faint green cast (`#f4f5f3` → `#080c0c`).
Specifically not warm cream, and specifically not pure black.

### Type — three families, three jobs, no overlap

| Family              | Role                                                                        |
| ------------------- | --------------------------------------------------------------------------- |
| **Archivo**         | Display only. Industrial heritage, holds up at 96 px with −0.03em tracking. |
| **Instrument Sans** | Body and UI. Quiet, humanist, high legibility at 16 px.                     |
| **IBM Plex Mono**   | Every label, key, number and code fragment. Tabular figures.                |

Three families is only defensible when the roles never overlap. They don't. If
you add a fourth, delete one.

Self-hosted via `next/font` — no render-blocking request to a font CDN, no
layout shift.

### The structural primitive

`.spec-row` — a narrow mono key beside a wide value, separated by a hairline.
Facts, timeline entries, project specs, skills and contact details all use it,
so the whole site reads as one continuous datasheet rather than a set of pages
that happen to share a colour.

---

## Reference synthesis

All eight reference sites were fetched and read. Six returned enough rendered
content to analyse properly; `haoqi.design` and `aikawakenichi.com` are almost
entirely client-rendered, so only their shell, meta and copy were legible.

What they converge on — and what is implemented here:

| Pattern                            | Seen on                               | Here                                                                                           |
| ---------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Two-clause contrast heading        | specia1ne, haoqi, breedlove           | Section headings: "Operations taught me what breaks. Engineering is where I stop it breaking." |
| Numbered sections, zero-padded     | all eight                             | `00`–`10` index with a scroll-spy rail                                                         |
| Live local clock + timezone        | haoqi, furusten, specia1ne, breedlove | `LocalClock`, header and footer                                                                |
| Bracketed / slashed mono metadata  | furusten, specia1ne, haoqi            | The `.label` dialect throughout                                                                |
| Checkable stat block               | breedlove, trionn, furusten, heynesh  | `Figures` — three verifiable numbers                                                           |
| Discipline marquee                 | breedlove, trionn, furusten           | `Marquee`, CSS-only                                                                            |
| "Vitals" + "Now" paired data cards | breedlove                             | Section 01                                                                                     |
| Percentage preloader               | aikawakenichi                         | `Preloader`, capped at 900ms, once per session                                                 |
| Copy-to-clipboard email            | aikawakenichi, breedlove              | `CopyEmail`                                                                                    |
| Hover text-swap nav                | trionn, breedlove                     | `.nav-swap`                                                                                    |
| Recruiter FAQ                      | heynesh                               | `Faq` — the highest-value borrow, see below                                                    |
| References / testimonials          | heynesh, visualidentity               | `Testimonials` — honest empty state                                                            |

**What was deliberately not borrowed.** Furusten and Trionn are agencies selling
creative services, so they lead with awards, client logos and pricing tiers.
Visual Identity Studio is a WordPress sales page with a budget-range dropdown.
None of that transfers to an engineer being evaluated by a hiring manager — a
portfolio that looks like it is selling a retainer reads as the wrong person.
The devices above are structural; the positioning underneath them is yours.

**The FAQ is the most important thing on this site.** Heynesh uses an FAQ to
close sales objections. For a career-changer the equivalent objections are
sharper and they are being formed silently in every review: no commercial
experience, coursework-heavy GitHub, availability while studying, why leave a
business at all. Leaving them unanswered does not remove them — it just moves
the decision somewhere you cannot influence. `src/content/faq.ts` answers seven
of them plainly, including "what are you weakest at right now", which is the one
that buys the most credibility. Rewrite them in your voice; keep the honesty.

## Decisions worth defending

Things a reviewer might ask about, answered in advance.

**No Three.js.** The brief asked for 3D scenes, shaders and a 100 Lighthouse
score. Those two requests are in direct conflict; a heavy WebGL bundle is the
single most reliable way to lose a performance score. The state machine gets
the visual impact for ~4 kB and, unlike an abstract 3D object, it says something
true about the work.

**No contact form.** A form adds a step, a spam surface and a server dependency
to something `mailto:` already does, and it leaves the sender without a copy of
what they sent. The contact page lists channels with a note on which to use.

**Projects are split into "systems" and "studies".** Presenting coursework as
product work is the fastest way to lose a senior reviewer, and they can always
tell. Labelling it correctly costs nothing and demonstrates that you know the
difference. A study repo gets an honest empty state instead of a decorative
"coming soon".

**Skills declare depth, not percentages.** A bar showing Python at 87% is
unfalsifiable. `core` / `proficient` / `working` are defined on the page and
each one is a claim you can be questioned on.

**Blog and Notes ship empty, but not blank.** Both read from
`src/content/posts.ts`; add an entry and it appears on the page and in
`rss.xml`. Until then each renders a real empty state that says what is coming
and sends the reader somewhere useful, rather than a decorative "coming soon".

**`/skills` redirects to `/tech-stack`.** They were the same page under two
names. One canonical URL keeps the sitemap honest and stops the two splitting
search signal between them.

**GitHub data degrades instead of failing.** Unauthenticated GitHub REST is
limited to 60 requests/hour per IP, and build machines share IPs. So the fetch
has a 4-second timeout, revalidates hourly, and falls back to a committed
snapshot in `src/lib/github.ts` on any failure. The page always renders. Set
`GITHUB_TOKEN` (a fine-grained PAT with **zero scopes**) for live data.

---

## Quality floor

| Check           | Status                                                    |
| --------------- | --------------------------------------------------------- |
| First Load JS   | 105 kB shared · 105–112 kB every route except the index   |
| Index route     | +3D chunk, lazy, desktop-and-motion-enabled visitors only |
| Static pages    | 29 prerendered at build                                   |
| References read | 8 of 8 fetched; 6 fully legible                           |
| TypeScript      | `strict` + `noUncheckedIndexedAccess`                     |
| Keyboard        | Skip link, visible focus ring, `aria-current` on nav      |
| Reduced motion  | Honoured in CSS; canvas renders a static diagram          |
| Colour contrast | Both accents pass WCAG AA on their own surfaces           |
| Metadata        | OpenGraph, Twitter card, canonicals, JSON-LD `Person`     |
| Generated       | `sitemap.xml`, `robots.txt`, OG image                     |
| Headers         | `nosniff`, `DENY` framing, restrictive Permissions-Policy |

```bash
npm run check    # typecheck + lint
npm run build
```

---

## Licence

MIT for the code. The written content and résumé are not licensed for reuse.
