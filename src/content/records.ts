/**
 * Timeline, credentials, and skills.
 *
 * `track` maps to the two-accent system in globals.css:
 *   "systems"    → --signal (teal)  — engineering
 *   "operations" → --ledger (ochre) — business
 * so a reader can see the two threads of your history without reading a word.
 */

export type Track = "systems" | "operations";

export interface TimelineEntry {
  id: string;
  start: string;
  end: string | "present";
  title: string;
  org: string;
  track: Track;
  location?: string;
  /** Two to four lines. Not a job description — what you are accountable for. */
  points: string[];
  tags?: string[];
}

export const timeline: TimelineEntry[] = [
  {
    id: "bits",
    start: "2026-03",
    end: "2030-03",
    title: "BSc, Computer Science",
    org: "Birla Institute of Technology and Science, Pilani",
    track: "systems",
    points: [
      "Semester 1 GPA 10.00 / 10.00.",
      "Concentration in computing systems and systems programming.",
      "Coursework so far: Computing Systems (C, pointers, memory), Discrete Mathematics, Linear Algebra.",
      "Ahead: operating systems, TCP/IP and client–server architecture, then multi-core and GPGPU programming.",
    ],
    tags: [
      "Computing Systems",
      "Discrete Mathematics",
      "Linear Algebra",
      "Operating Systems",
      "Networks",
    ],
  },
  {
    id: "backend",
    start: "2025-06",
    end: "present",
    title: "Backend engineering — self-directed",
    org: "Independent",
    track: "systems",
    points: [
      "Structured path through Python internals, typing, concurrency, data structures and algorithms.",
      "Shipped OrderFlow: multi-tenant order management with enforced tenant isolation.",
      "Building site-auditor: concurrent crawler with bounded, rate-limited async I/O under mypy --strict.",
      "Typed by default — Protocols at the interfaces, strict mypy across everything new.",
    ],
    tags: ["Python", "Flask", "FastAPI", "asyncio", "mypy", "pytest", "Git"],
  },
  {
    id: "oss",
    start: "2026-08",
    end: "present",
    title: "Open-source contributor — Python ecosystem",
    org: "Litestar · Strawberry GraphQL · KubeEdge Ianvs",
    track: "systems",
    points: [
      "Three pull requests merged into two widely used Python projects, reviewed by core maintainers.",
      "Litestar: corrected HTTP semantics for multipart part-limit violations — 413 in place of 400, with regression tests and a breaking-change note.",
      "Strawberry GraphQL: corrected PEP 681 dataclass_transform metadata so static type-checker behaviour matches runtime.",
      "Two further fixes in review upstream on KubeEdge Ianvs, a CNCF edge-AI benchmarking framework.",
    ],
    tags: ["Python", "HTTP semantics", "PEP 681", "mypy", "pytest", "Code review"],
  },
  {
    id: "sih",
    start: "2026-09",
    end: "2026-09",
    title: "Team lead — Smart India Hackathon 2026",
    org: "Team Return-Path · problem statement SIH26106",
    track: "systems",
    points: [
      "Led six engineers building Postmark, an email threat detection and forensic intelligence platform.",
      "Owned the backend: FastAPI service, PostgreSQL schema and access layer.",
      "Set the test suite and branch-and-review workflow the team shipped against.",
    ],
    tags: ["FastAPI", "PostgreSQL", "Async", "Team lead"],
  },
  {
    id: "cs50",
    start: "2025-06",
    end: "2025-12",
    title: "CS50x — Introduction to Computer Science",
    org: "Harvard University · edX",
    track: "systems",
    points: [
      "C, memory and data structures before moving to higher-level languages.",
      "Final project: OrderFlow.",
    ],
    tags: ["C", "Algorithms", "SQL"],
  },
  {
    id: "agam",
    start: "2024-05",
    end: "present",
    title: "Managing Director",
    org: "Agam Agrovet Private Limited",
    track: "operations",
    location: "West Bengal, India",
    points: [
      "Accountable for production, quality standards, procurement and finance at an animal feed manufacturer.",
      "Ran the constraint side of a physical system: batch tolerances, supplier reliability, working capital.",
      "The transferable part is the ordering — failure modes and edge cases get designed for first, not patched later.",
    ],
    tags: ["Operations", "Procurement", "Inventory", "Finance"],
  },
  {
    id: "anandam",
    start: "2022-09",
    end: "present",
    title: "Managing Director",
    org: "Anandam Breeding Private Limited",
    track: "operations",
    location: "West Bengal, India",
    points: [
      "Operations, distribution and supply for animal health and livestock products.",
      "Coordination across production, supply chain and distribution.",
    ],
    tags: ["Operations", "Supply Chain", "Distribution"],
  },
  {
    id: "school",
    start: "2018",
    end: "2020",
    title: "Higher Secondary, Computer Science",
    org: "Bishnupur High School",
    track: "systems",
    points: ["First contact with programming."],
  },
];

/* ─────────────────────────────────────────────────────────────── roadmap ── */

export interface RoadmapStage {
  phase: string;
  title: string;
  state: "done" | "current" | "next";
  detail: string;
}

/** Move a stage to "done" only when there is a repository to point at. */
export const roadmap: RoadmapStage[] = [
  {
    phase: "01",
    title: "Fundamentals",
    state: "done",
    detail:
      "C, memory, data structures, algorithms. CS50x, then continued in C on my own.",
  },
  {
    phase: "02",
    title: "Backend in depth",
    state: "current",
    detail:
      "APIs, data modelling, authentication, and typed service code. One stack understood " +
      "properly rather than five sampled.",
  },
  {
    phase: "03",
    title: "Systems and concurrency",
    state: "current",
    detail:
      "asyncio in anger: bounded concurrency, rate limiting, retries with jitter and " +
      "timeouts, behind Protocol-defined interfaces. Shipping in site-auditor and in " +
      "the FastAPI service behind Postmark.",
  },
  {
    phase: "04",
    title: "ML systems",
    state: "next",
    detail:
      "Serving, evaluation, data pipelines and the infrastructure models actually run on — " +
      "the backend problem, with a harder correctness story. Started from the " +
      "infrastructure side: upstream work on a CNCF edge-AI benchmarking framework.",
  },
];

/* ────────────────────────────────────────────────────── academic record ── */

/**
 * A grade is only worth publishing if a reader can check it, which is why
 * `gradeSheet` is not optional here. "10.00 GPA" with no link is a claim;
 * "10.00 GPA" beside the issuing document is a fact.
 */
export const academicRecord = {
  programme: "BSc (Hons) Computer Science",
  institution: "Birla Institute of Technology and Science, Pilani",
  mode: "Digital Learning Division · online",
  span: "Mar 2026 — Mar 2030",
  gpa: "10.00 / 10.00",
  gpaScope: "Semester 1",
  gradeSheet:
    "https://drive.google.com/file/d/1cmoGGjo0JJqvOfm7dNUd6ReuAp0rZw04/view?usp=sharing",
  coursework: [
    "Introduction to Computing Systems — C, pointers, memory",
    "Discrete Mathematics",
    "Linear Algebra & Optimisation",
  ],
} as const;

/* ────────────────────────────────────────────────────── ai trajectory ──── */

/**
 * Evidence for the AI direction, and nothing that is not evidence.
 *
 * The temptation on a page like this is to list what you intend to learn and
 * let the reader mistake it for what you have done. `state` exists to make
 * that impossible: "shipped" means there is something to open, "active" means
 * it is underway and unfinished, "planned" means it has not started. A
 * reviewer who can see the difference at a glance trusts the whole page more,
 * not less.
 */
export interface AiMilestone {
  title: string;
  org: string;
  state: "shipped" | "active" | "planned";
  detail: string;
  href?: string;
}

export const aiTrajectory: AiMilestone[] = [
  {
    title: "KubeEdge Ianvs — upstream fixes",
    org: "CNCF · distributed synergy AI benchmarking",
    state: "active",
    detail:
      "Two fixes in review on the framework CNCF uses to benchmark edge–cloud " +
      "collaborative learning: a dataset-config parser that silently swallowed " +
      "unknown keys, and an error message that named a filename the loader does " +
      "not look for. Both are infrastructure defects rather than model work — " +
      "which is the layer of AI systems I am aiming at.",
    href: "/open-source",
  },
  {
    title: "Postmark — the service layer around a classifier",
    org: "Smart India Hackathon 2026 · team lead",
    state: "shipped",
    detail:
      "Owned the backend for an ML-backed email threat detection platform: async " +
      "FastAPI request handling, the PostgreSQL schema holding the evidence behind " +
      "each verdict, and the boundary between the API and the model. The model was " +
      "not mine. Everything it needed in order to be useful was.",
    href: "/projects/postmark",
  },
  {
    title: "site-auditor — concurrency under real limits",
    org: "Self-directed",
    state: "active",
    detail:
      "Bounded concurrency, rate limiting, retries with jitter and Protocol-defined " +
      "interfaces. Inference serving and data pipelines are the same problem with " +
      "more expensive units of work, so this is the prerequisite rather than a " +
      "detour.",
    href: "/projects/site-auditor",
  },
  {
    title: "CS50 AI with Python",
    org: "Harvard University · edX",
    state: "active",
    detail:
      "Search, knowledge representation, optimisation, learning and neural " +
      "networks. In progress — listed here as in progress, not as a credential.",
  },
  {
    title: "Karpathy's neural networks series, then Stanford CS336",
    org: "Planned · after the backend track",
    state: "planned",
    detail:
      "Building a language model from scratch, then the systems course on how one " +
      "is actually trained and served. Deliberately sequenced after backend " +
      "employability rather than in parallel with it: two half-finished tracks " +
      "are worth less than one finished one.",
  },
];

/* ───────────────────────────────────────────────────────── credentials ──── */

export interface Credential {
  title: string;
  issuer: string;
  issued: string;
  grade?: string;
  /**
   * Public verification link. Optional, because some issuers hand you a
   * credential ID and no public URL — and inventing a link that 404s is a
   * worse failure than showing the ID and letting a reviewer verify it their
   * own way. Where `url` is absent, `credentialId` renders instead.
   */
  url?: string;
  credentialId?: string;
  covers: string[];
}

export const credentials: Credential[] = [
  {
    title: "Inclusive Open Source Community Orientation (LFC102)",
    issuer: "The Linux Foundation",
    issued: "2026-08",
    credentialId: "LF-i2mlam8vod",
    covers: ["Open source", "Community norms", "Contribution etiquette", "Code review"],
  },
  {
    title: "CS50x: Introduction to Computer Science",
    issuer: "Harvard University · edX",
    issued: "2025",
    url: "https://certificates.cs50.io/c523d8dd-575d-4ed8-bd5f-24a4c990067f.pdf?size=letter",
    covers: ["C", "Memory", "Data Structures", "Algorithms", "SQL", "Python"],
  },
  {
    title: "Using Databases with Python",
    issuer: "University of Michigan · Coursera",
    issued: "2026-01",
    grade: "97.88%",
    url: "https://coursera.org/share/59cd4c3af69f94bb055c6b2e8018eb31",
    covers: ["SQL", "Data modelling", "Relational design", "SQLite"],
  },
  {
    title: "Using Python to Access Web Data",
    issuer: "University of Michigan · Coursera",
    issued: "2025-12",
    grade: "98.76%",
    url: "https://coursera.org/share/03f1637f8d472a890005abf8e7f4c13a",
    covers: ["HTTP", "Regex", "JSON", "XML", "REST APIs"],
  },
  {
    title: "Python Data Structures",
    issuer: "University of Michigan · Coursera",
    issued: "2025-12",
    grade: "99.19%",
    url: "https://coursera.org/share/e39d0c93c0e418ce5fed5972db467d58",
    covers: ["Lists", "Dictionaries", "Tuples", "File handling"],
  },
  {
    title: "Programming for Everybody (Getting Started with Python)",
    issuer: "University of Michigan · Coursera",
    issued: "2025-12",
    grade: "99.99%",
    url: "https://coursera.org/share/fb31ceb9795c03e531a532bc2f4acfca",
    covers: ["Python syntax", "Control flow", "Functions"],
  },
  {
    title: "Python (Basic)",
    issuer: "HackerRank",
    issued: "2025-12",
    url: "https://www.hackerrank.com/certificates/7828adacf80c",
    covers: ["Python", "Problem solving"],
  },
];

/* ────────────────────────────────────────────────────────────── skills ──── */

export type Depth = "working" | "proficient" | "core";

export interface SkillGroup {
  group: string;
  note: string;
  items: { name: string; depth: Depth }[];
}

/**
 * Depth is declared, not implied by a progress bar. Percentage bars on a skills
 * page are unfalsifiable and every reviewer knows it. These three levels mean:
 *
 *   core       — you can defend design decisions in it under questioning
 *   proficient — you can build unaided, and know where you're weak
 *   working    — you can read it and get things done with the docs open
 */
export const skills: SkillGroup[] = [
  {
    group: "Languages",
    note: "Ordered by what I would want to be interviewed in.",
    items: [
      { name: "Python", depth: "core" },
      { name: "SQL", depth: "proficient" },
      { name: "C", depth: "proficient" },
      { name: "TypeScript", depth: "working" },
      { name: "HTML / CSS", depth: "working" },
    ],
  },
  {
    group: "Backend",
    note: "Where most of my time goes.",
    items: [
      { name: "REST API design", depth: "core" },
      { name: "HTTP semantics", depth: "core" },
      { name: "Flask", depth: "core" },
      { name: "FastAPI", depth: "proficient" },
      { name: "PostgreSQL", depth: "proficient" },
      { name: "SQLite / relational design", depth: "proficient" },
      { name: "Data modelling", depth: "proficient" },
      { name: "Multi-tenant architecture", depth: "proficient" },
      { name: "Session authentication & RBAC", depth: "proficient" },
      { name: "Password hashing & CSRF protection", depth: "proficient" },
      { name: "Jinja2", depth: "working" },
    ],
  },
  {
    group: "Async & concurrency",
    note: "Built into site-auditor and the service layer behind Postmark.",
    items: [
      { name: "asyncio", depth: "proficient" },
      { name: "httpx", depth: "proficient" },
      { name: "Bounded concurrency", depth: "proficient" },
      { name: "Retries, backoff & jitter", depth: "proficient" },
      { name: "Timeouts", depth: "proficient" },
      { name: "Per-host rate limiting", depth: "proficient" },
      { name: "robots.txt compliance", depth: "working" },
    ],
  },
  {
    group: "Typing, testing & quality",
    note: "The things that decide whether code survives contact with a second reader.",
    items: [
      { name: "mypy --strict", depth: "core" },
      { name: "Protocols & structural typing", depth: "core" },
      { name: "Generics", depth: "proficient" },
      { name: "Dataclasses", depth: "proficient" },
      { name: "Decorators, generators & context managers", depth: "proficient" },
      { name: "pytest & regression testing", depth: "proficient" },
      { name: "ruff / ESLint", depth: "proficient" },
      { name: "Pre-commit hooks & CI", depth: "proficient" },
      { name: "Code review", depth: "proficient" },
    ],
  },
  {
    group: "Computer science",
    note: "Formalised through BITS Pilani, applied in practice repositories.",
    items: [
      { name: "Data structures", depth: "proficient" },
      { name: "Algorithms & graph search", depth: "proficient" },
      { name: "Memory management", depth: "proficient" },
      { name: "Discrete mathematics", depth: "working" },
      { name: "Linear algebra", depth: "working" },
      { name: "Operating systems", depth: "working" },
      { name: "TCP/IP & client–server", depth: "working" },
    ],
  },
  {
    group: "Infrastructure & web",
    note: "Enough to ship and operate what I build, without claiming to be an SRE.",
    items: [
      { name: "Git / GitHub", depth: "proficient" },
      { name: "GitHub Actions", depth: "proficient" },
      { name: "Linux & Bash", depth: "proficient" },
      { name: "Cloudflare Pages / Workers", depth: "proficient" },
      { name: "Content-Security-Policy", depth: "proficient" },
      { name: "uv", depth: "working" },
      { name: "GraphQL", depth: "working" },
      { name: "Next.js & React", depth: "working" },
      { name: "Tailwind CSS", depth: "working" },
      { name: "Zod", depth: "working" },
    ],
  },
];

export const languages = [
  { name: "English", level: "Native / full professional" },
  { name: "Bengali", level: "Native" },
  { name: "Hindi", level: "Professional working" },
] as const;
