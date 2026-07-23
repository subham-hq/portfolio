/**
 * Single source of truth for identity and copy.
 *
 * Every visitor-facing string on the site is in this file or its two siblings
 * (projects.ts, records.ts). Nothing is hard-coded into a component, so
 * updating the site never means editing JSX.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://subhambhattacharya.com";

export const person = {
  name: "Subham Bhattacharya",
  shortName: "Subham",
  role: "Backend Engineer",
  target: "AI/ML Systems",
  location: "West Bengal, India",
  coords: "22.6708° N · 87.3200° E",
  timezone: "Asia/Kolkata",
  utcOffset: "UTC+05:30",
  email: "subham.bh@icloud.com",
} as const;

export const links = {
  github: "https://github.com/subham-hq",
  linkedin: "https://www.linkedin.com/in/subham-bh/",
  x: "https://x.com/subhamhq",
  youtube: "https://www.youtube.com/@subham.bhattacharya",
  discord: "https://discord.com/users/1457056899773235200",
  email: `mailto:${person.email}`,
  resume: "/subham-bhattacharya-resume.pdf",
} as const;

export const githubUser = "subham-hq";

/* ──────────────────────────────────────────────────────────────────── bio ── */

export const bio = {
  headline: "I build backend systems that stay correct as they grow.",

  lede:
    "I'm Subham Bhattacharya — a backend engineer working in Python and a Computer " +
    "Science student at BITS Pilani. I work on APIs, data models and the service " +
    "logic that decides what a system is permitted to do: the parts that have to " +
    "hold when something goes wrong.",

  oneLiner: "Backend engineer working in Python, building toward AI/ML systems.",

  short:
    "Subham Bhattacharya is a backend engineer working in Python and a Computer " +
    "Science student at BITS Pilani. He came to software from manufacturing " +
    "operations, and builds APIs, data models and service logic designed to stay " +
    "correct as systems grow.",

  elevator:
    "I build backend software in Python — APIs, data models, authentication, the " +
    "service logic that has to hold as a system grows. I came to engineering from " +
    "operations: four years running production, procurement and finance at a feed " +
    "manufacturer in West Bengal. That work taught me to think in systems, " +
    "constraints and failure modes before I could write one line of production " +
    "code. I'm formalising the fundamentals through a CS degree at BITS Pilani, and " +
    "I'm building toward AI/ML systems — because that work runs on exactly the kind " +
    "of reliable infrastructure I'm focused on now.",

  long: [
    "I'm Subham Bhattacharya, a backend engineer working mainly in Python and a " +
      "Computer Science student at BITS Pilani. The parts of a system I care about " +
      "are the ones that have to stay correct under pressure — APIs, data models, " +
      "authentication, and the service logic that decides what a system is " +
      "permitted to do.",
    "Most of what I write is service and pipeline code: Protocols at the " +
      "interfaces, generics for what moves through them, strict mypy across all of " +
      "it, nothing computed until something asks for it. I would rather understand " +
      "one stack deeply enough to defend every trade-off out loud than collect " +
      "frameworks I have touched once.",
    "I design for the failure case before the happy path. That habit came from " +
      "four years running a manufacturing operation — production, quality, " +
      "procurement, finance — where a tolerance drifting means a batch is scrap and " +
      "a supplier slipping means a line stops. Physical systems teach you quickly " +
      "that a process which fails loudly is cheap and one that fails quietly is " +
      "expensive. The ordering carried straight into how I write software.",
    "Graph search and C take up much of the rest of my time, and both changed how " +
      "I design in Python — one for how I reason about structure, the other for " +
      "what an operation actually costs. The degree formalises this, with a " +
      "concentration in computing systems and systems programming.",
    "Longer term I'm building toward AI/ML systems. Serving, data pipelines, " +
      "evaluation and behaviour under load are infrastructure problems with a " +
      "harder correctness story — which is exactly the kind of work I want to be " +
      "doing, and exactly why the foundation matters.",
    "Everything on my GitHub is meant to be read: clean repositories, honest " +
      "documentation, and projects I can stand behind in a technical conversation.",
  ],

  metaDescription:
    "Subham Bhattacharya — backend engineer working in Python. APIs, data models and " +
    "service logic. CS at BITS Pilani. Building toward AI/ML systems.",

  ogDescription:
    "Backend engineer working in Python. Multi-tenant systems, typed service code and " +
    "CS fundamentals — reached engineering from four years running manufacturing " +
    "operations. Studying Computer Science at BITS Pilani.",
} as const;

/* ─────────────────────────────────────────────────────────── hero figures ── */

/**
 * Every figure here is checkable. A portfolio statistic that cannot be verified
 * is worse than no statistic — it invites the reviewer to discount the rest.
 */
export const figures = [
  { value: "04", unit: "yrs", label: "owning production, procurement and finance" },
  { value: "06", unit: "certs", label: "verified — Harvard, Michigan, HackerRank" },
  { value: "BITS", unit: "Pilani", label: "BSc Computer Science, 2026–2030" },
] as const;

/** Scrolling marquee under the hero. Disciplines, not buzzwords. */
export const disciplines = [
  "Python",
  "REST API design",
  "Data modelling",
  "Authentication",
  "Multi-tenant architecture",
  "SQL",
  "Type-driven design",
  "C",
  "Graph search",
  "Operating systems",
  "TCP/IP",
  "Backend engineering",
  "Building toward AI/ML systems",
] as const;

/* ─────────────────────────────────────────────────────────────── vitals ──── */

export const vitals = [
  {
    key: "Currently",
    value: "Backend engineer",
    detail: "Python · Flask · SQL · typed service code",
  },
  {
    key: "Studying",
    value: "BSc Computer Science",
    detail: "BITS Pilani · computing systems track",
  },
  {
    key: "Based in",
    value: person.location,
    detail: `${person.coords} · ${person.utcOffset}`,
  },
  {
    key: "Open to",
    value: "Backend / platform roles",
    detail: "Remote or relocation · replying within a day",
  },
] as const;

/** The "Now" block. A stale entry here is worse than an empty one — it tells a
 *  reader the site was abandoned. Review it monthly. */
export const now = {
  updated: "2026-07",
  entries: [
    {
      key: "Building",
      label: "Typed pipeline code",
      detail: "Protocols at the interfaces, strict mypy across all of it",
    },
    {
      key: "Learning",
      label: "Concurrency in Python",
      detail: "asyncio, queues, and what actually blocks",
    },
    {
      key: "Reading",
      label: "Designing Data-Intensive Applications",
      detail: "Martin Kleppmann",
    },
    {
      key: "Last shipped",
      label: "OrderFlow",
      detail: "Multi-tenant order management · CS50x final project",
    },
  ],
} as const;

/* ───────────────────────────────────────────────────────── section index ─── */

/** Drives the numbered rail on the index page. Order carries meaning here: it
 *  is the sequence a reader should meet the material in. */
export const sections = [
  { id: "intro", num: "00", label: "Intro" },
  { id: "vitals", num: "01", label: "Vitals" },
  { id: "approach", num: "02", label: "Approach" },
  { id: "work", num: "03", label: "Work" },
  { id: "trajectory", num: "04", label: "Trajectory" },
  { id: "stack", num: "05", label: "Stack" },
  { id: "credentials", num: "06", label: "Credentials" },
  { id: "repositories", num: "07", label: "Repositories" },
  { id: "questions", num: "08", label: "Questions" },
  { id: "references", num: "09", label: "References" },
  { id: "contact", num: "10", label: "Contact" },
] as const;

/* ──────────────────────────────────────────────────────────────────── nav ── */

export const nav = [
  { href: "/", label: "Index" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/experience", label: "Experience" },
  { href: "/tech-stack", label: "Stack" },
  { href: "/resume", label: "Résumé" },
  { href: "/contact", label: "Contact" },
] as const;

/** Secondary pages live in the footer so the header stays scannable. */
export const footerNav = {
  Work: [
    { href: "/projects", label: "Projects" },
    { href: "/open-source", label: "Open source" },
    { href: "/github", label: "GitHub stats" },
  ],
  Background: [
    { href: "/about", label: "About" },
    { href: "/experience", label: "Experience" },
    { href: "/education", label: "Education" },
    { href: "/timeline", label: "Timeline" },
    { href: "/ai-journey", label: "AI journey" },
  ],
  Detail: [
    { href: "/skills", label: "Skills" },
    { href: "/tech-stack", label: "Tech stack" },
    { href: "/certifications", label: "Certifications" },
    { href: "/resume", label: "Résumé" },
  ],
  Writing: [
    { href: "/blog", label: "Blog" },
    { href: "/writing", label: "Notes" },
    { href: "/rss.xml", label: "RSS" },
  ],
} as const;

export const legalNav = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/sitemap.xml", label: "Sitemap" },
] as const;
