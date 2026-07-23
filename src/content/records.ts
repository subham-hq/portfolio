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
      "Concentration in computing systems and systems programming.",
      "Operating systems, memory management, TCP/IP and client–server architecture.",
      "Multi-core and GPGPU programming for compute-bound workloads.",
    ],
    tags: ["Operating Systems", "Networks", "HPC", "C++", "Java", "Python"],
  },
  {
    id: "backend",
    start: "2025-06",
    end: "present",
    title: "Backend engineering — self-directed",
    org: "Independent",
    track: "systems",
    points: [
      "Structured path through Python internals, typing, data structures and algorithms.",
      "Shipped OrderFlow: multi-tenant order management with enforced tenant isolation.",
      "Working toward typed, testable pipeline code — Protocols at interfaces, strict mypy throughout.",
    ],
    tags: ["Python", "Flask", "SQL", "mypy", "Git"],
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
      "Operations, distribution and supply for poultry and livestock products.",
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
    state: "next",
    detail:
      "asyncio, queues, caching and the failure behaviour of distributed components. " +
      "Formalised alongside the systems track at BITS.",
  },
  {
    phase: "04",
    title: "ML systems",
    state: "next",
    detail:
      "Serving, evaluation, data pipelines and the infrastructure models actually run on — " +
      "the backend problem, with a harder correctness story.",
  },
];

/* ───────────────────────────────────────────────────────── credentials ──── */

export interface Credential {
  title: string;
  issuer: string;
  issued: string;
  grade?: string;
  url: string;
  covers: string[];
}

export const credentials: Credential[] = [
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
      { name: "JavaScript", depth: "working" },
      { name: "C++", depth: "working" },
      { name: "Java", depth: "working" },
    ],
  },
  {
    group: "Backend",
    note: "Where most of my time goes.",
    items: [
      { name: "REST API design", depth: "core" },
      { name: "Flask", depth: "core" },
      { name: "Data modelling", depth: "proficient" },
      { name: "Authentication & sessions", depth: "proficient" },
      { name: "Password hashing", depth: "proficient" },
      { name: "Multi-tenant architecture", depth: "proficient" },
      { name: "SQLite / relational design", depth: "proficient" },
    ],
  },
  {
    group: "Computer science",
    note: "Formalised through BITS Pilani, applied in practice repositories.",
    items: [
      { name: "Data structures", depth: "proficient" },
      { name: "Algorithms & graph search", depth: "proficient" },
      { name: "Memory management", depth: "proficient" },
      { name: "Operating systems", depth: "working" },
      { name: "TCP/IP & client–server", depth: "working" },
      { name: "Concurrency", depth: "working" },
    ],
  },
  {
    group: "Engineering practice",
    note: "The things that decide whether code survives contact with a second reader.",
    items: [
      { name: "Type annotations & mypy", depth: "proficient" },
      { name: "Git / GitHub", depth: "proficient" },
      { name: "Debugging", depth: "proficient" },
      { name: "Testing", depth: "working" },
      { name: "Technical writing", depth: "proficient" },
    ],
  },
];

export const languages = [
  { name: "English", level: "Native / full professional" },
  { name: "Bengali", level: "Native" },
  { name: "Hindi", level: "Professional working" },
] as const;
