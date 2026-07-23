/**
 * Project data.
 *
 * The `kind` field is doing real work here, so don't remove it.
 *
 *   "system" — something you designed, made trade-offs in, and can defend for
 *              thirty minutes in a technical interview.
 *   "study"  — deliberate practice. Real code, honestly labelled as learning.
 *
 * Presenting coursework as if it were product work is the fastest way to lose a
 * senior reviewer. Labelling it correctly costs nothing and buys credibility:
 * it says you know the difference. Promote a repo from "study" to "system" only
 * when the case study below can be filled in without hand-waving.
 */

export type ProjectKind = "system" | "study";

export interface CaseStudySection {
  heading: string;
  body: string[];
}

export interface Project {
  slug: string;
  name: string;
  kind: ProjectKind;
  /** One line. Appears in listings and OG cards. */
  summary: string;
  /** Two or three sentences. Appears at the top of the detail page. */
  overview: string;
  year: string;
  status: "shipped" | "active" | "archived";
  stack: string[];
  repo: string;
  demo?: string;
  featured: boolean;
  /** Left empty for study repos — the UI renders a correct empty state instead. */
  sections: CaseStudySection[];
  /** Short, checkable facts. Rendered as spec rows. */
  facts?: { key: string; value: string }[];
}

export const projects: Project[] = [
  {
    slug: "orderflow",
    name: "OrderFlow",
    kind: "system",
    summary:
      "Multi-tenant B2B order management with enforced per-company data isolation.",
    overview:
      "A B2B order management system where several companies operate inside one " +
      "deployment without ever seeing each other's data. Product catalogues, client " +
      "accounts and purchase orders are scoped to a tenant at the query layer, and " +
      "an order can only move through the states the business actually permits.",
    year: "2025",
    status: "shipped",
    stack: ["Python", "Flask", "SQLite", "Jinja", "Werkzeug", "Flask-Session"],
    repo: "https://github.com/subham-hq/orderflow",
    demo: "https://youtu.be/xvPRFuExpm0",
    featured: true,
    facts: [
      { key: "Isolation", value: "company_id scoping on every read and write path" },
      { key: "Access control", value: "admin_required / client_required decorators" },
      { key: "Order states", value: "pending → approved → fulfilled | rejected" },
      { key: "Money", value: "Integers in paise. No floats anywhere near a total." },
      { key: "Sessions", value: "Server-side (Flask-Session), not signed cookies" },
    ],
    sections: [
      {
        heading: "Problem",
        body: [
          "A single-tenant order tool is straightforward. The moment more than one " +
            "company shares a deployment, every query becomes a place where one " +
            "customer can read another's data — and a leak here isn't a bug report, " +
            "it's the end of the product.",
          "The second problem is the order itself. An order is not a row that gets " +
            "edited; it is a thing that moves through states, and only some moves " +
            "are legal. Left unconstrained, an order can be fulfilled before it is " +
            "approved, or rejected after it has shipped.",
        ],
      },
      {
        heading: "Approach",
        body: [
          "Tenancy is enforced at the data-access boundary rather than in the " +
            "templates. Every query is scoped by company_id, so isolation is a " +
            "property of how data is fetched, not of whether a given page " +
            "remembered to filter. Forgetting the scope produces no rows rather " +
            "than someone else's rows.",
          "Authorisation is expressed as decorators — admin_required and " +
            "client_required — so the permission for a route sits directly above " +
            "the route, where it can be read and audited without tracing calls.",
          "The order lifecycle is a state machine with explicit legal transitions. " +
            "Illegal transitions are rejected server-side, not hidden in the UI.",
          "Currency is stored as integers in paise. Floating-point money produces " +
            "totals that are almost right, which in a purchasing system is worse " +
            "than being obviously wrong.",
        ],
      },
      {
        heading: "Trade-offs",
        body: [
          "SQLite, not Postgres. For a single-node deployment at this scale SQLite " +
            "removes an entire operational surface, and the schema is portable when " +
            "concurrent write volume justifies the move. That threshold is a real " +
            "number, not a someday.",
          "Server-rendered Jinja, not an API plus a SPA. The system has no second " +
            "client, so a JSON API would have been an interface built for an " +
            "imaginary consumer. Adding one later is a smaller job than maintaining " +
            "one that nothing calls.",
          "Row-scoped tenancy, not a database per tenant. Simpler to operate and " +
            "adequate at this size; schema-per-tenant is the next step if a " +
            "customer ever requires physical separation.",
        ],
      },
      {
        heading: "What I'd change",
        body: [
          "The isolation guarantee is currently upheld by discipline. It should be " +
            "upheld by tests — a suite that asserts, for each model, that a request " +
            "authenticated as tenant A cannot reach a record belonging to tenant B.",
          "State transitions belong in one table-driven definition rather than being " +
            "checked at each call site, so that adding a state is a single edit.",
        ],
      },
    ],
  },
  {
    slug: "python-deep-dive",
    name: "python-deep-dive",
    kind: "study",
    summary:
      "Core Python internals rebuilt by hand: decorators, iterators, generators, context managers.",
    overview:
      "From-scratch implementations of the language machinery most people only " +
      "consume. Each folder is a self-contained mini-project with a runnable demo " +
      "and its own README; the index is generated on push so it cannot drift from " +
      "what is actually in the repository.",
    year: "2026",
    status: "active",
    stack: ["Python 3.12", "mypy", "No third-party dependencies"],
    repo: "https://github.com/subham-hq/python-deep-dive",
    featured: true,
    facts: [
      { key: "Dependencies", value: "None. Standard library only." },
      { key: "Index", value: "Generated from per-folder READMEs on every push to main" },
      { key: "In progress", value: "mypy --strict coverage, then asyncio" },
    ],
    sections: [],
  },
  {
    slug: "python-web-data",
    name: "python_web_data_projects",
    kind: "study",
    summary: "Retrieving and parsing web data: HTTP, regex, JSON, XML, REST APIs.",
    overview:
      "Scripts and small projects for getting data out of the web and into a usable " +
      "shape — request handling, parsing, extraction and transformation across the " +
      "formats real services actually return.",
    year: "2025",
    status: "archived",
    stack: ["Python", "urllib", "BeautifulSoup", "JSON", "XML", "Regex"],
    repo: "https://github.com/subham-hq/python_web_data_projects",
    featured: false,
    sections: [],
  },
  {
    slug: "c-programming-fundamental",
    name: "c-programming-fundamental",
    kind: "study",
    summary: "C fundamentals — memory, pointers, and what Python is doing underneath.",
    overview:
      "Working through C to make the abstractions in higher-level code concrete: " +
      "manual memory management, pointer semantics, and the cost model behind " +
      "operations that look free in Python.",
    year: "2025",
    status: "active",
    stack: ["C", "GCC", "Make"],
    repo: "https://github.com/subham-hq/c-programming-fundamental",
    featured: false,
    sections: [],
  },
  {
    slug: "leetcode-solutions",
    name: "leetcode-solutions",
    kind: "study",
    summary: "Algorithm practice, kept for the reasoning rather than the answer.",
    overview:
      "Solutions kept for the write-ups: the approach, why it beats the obvious one, " +
      "and the complexity that follows. Graph search is the current concentration.",
    year: "2026",
    status: "active",
    stack: ["Python", "C"],
    repo: "https://github.com/subham-hq/leetcode-solutions",
    featured: false,
    sections: [],
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
export const systemProjects = projects.filter((p) => p.kind === "system");
export const studyProjects = projects.filter((p) => p.kind === "study");

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
