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

export interface ProjectVideo {
  /** YouTube id — the part after `v=` or `youtu.be/`, not the whole URL. */
  id: string;
  /** Iframe title and the play button's accessible name. */
  title: string;
  /** Optional local poster in /public. Without one the facade draws itself. */
  poster?: string;
  caption?: string;
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
  /**
   * Omitted when there is no public repository. Say why in `repoNote` rather
   * than leaving a reader to assume there is nothing to show — an unexplained
   * missing link reads as a gap, an explained one reads as a decision.
   */
  repo?: string;
  repoNote?: string;
  demo?: string;
  /** Renders a click-to-load player on the case study page. */
  video?: ProjectVideo;
  featured: boolean;
  /** Left empty for study repos — the UI renders a correct empty state instead. */
  sections: CaseStudySection[];
  /** Short, checkable facts. Rendered as spec rows. */
  facts?: { key: string; value: string }[];
}

export const projects: Project[] = [
  {
    slug: "postmark",
    name: "Postmark",
    kind: "system",
    summary:
      "Email threat detection with geolocation and forensic intelligence, built by a team of six.",
    overview:
      "An email threat detection platform built for Smart India Hackathon 2026 " +
      "under problem statement SIH26106: classify a message, place it, and leave " +
      "a forensic trail an analyst can actually follow afterwards. I led a team of " +
      "six and owned the backend — the FastAPI service, the schema and access " +
      "layer, and the test and branch workflow the other five shipped against.",
    year: "2026",
    status: "shipped",
    stack: [
      "Python",
      "FastAPI",
      "Async services",
      "PostgreSQL",
      "pytest",
      "Git workflows",
    ],
    repoNote: "Private by design — hackathon submission. Walkthrough on request.",
    featured: true,
    facts: [
      { key: "Role", value: "Team lead — six engineers, backend owner" },
      { key: "Event", value: "Smart India Hackathon 2026 · problem statement SIH26106" },
      {
        key: "Team",
        value: "Backend, DevOps, ML, frontend and pitch — split by discipline",
      },
      { key: "Service", value: "FastAPI with async request handling" },
      { key: "Store", value: "PostgreSQL — schema and access layer" },
      { key: "Source", value: "Private. This is a submission, not a product." },
    ],
    sections: [
      {
        heading: "Problem",
        body: [
          "Email threat detection is usually presented as a classification " +
            "problem, and classification is the part that demos well. The part " +
            "that decides whether the tool is usable is what happens after the " +
            "verdict: an analyst has to be able to ask why this message was " +
            "flagged, where it came from, and what else arrived from the same " +
            "place — and get an answer that holds up.",
          "That reframes it as a backend problem. The model produces a label; the " +
            "system has to store the evidence behind that label, keep it " +
            "attributable, and serve it back fast enough that checking is cheaper " +
            "than guessing.",
        ],
      },
      {
        heading: "Approach",
        body: [
          "FastAPI, with request handling async throughout. The work in this " +
            "service is almost entirely waiting — on the classifier, on " +
            "geolocation lookups, on the database. Threads would have spent most " +
            "of their memory sitting idle; an event loop holds far more concurrent " +
            "requests on the same box for the same reason.",
          "PostgreSQL rather than SQLite, which is the opposite of the call I made " +
            "on OrderFlow and made for the opposite reason. Forensic intelligence " +
            "means concurrent writers appending evidence while analysts read " +
            "across it, and that is precisely the workload SQLite's single-writer " +
            "model is not built for.",
          "My second job was not code. Six people on a fixed deadline fail on " +
            "integration, not on features, so the schema, the access layer and the " +
            "branch-and-review workflow existed before the parallel work started. " +
            "Everyone built against a boundary that was already defined.",
        ],
      },
      {
        heading: "Trade-offs",
        body: [
          "The repository is private, and it stays private. A hackathon submission " +
            "is written to a deadline and the code shows it; publishing it to look " +
            "productive would invite exactly the scrutiny it was never built to " +
            "survive. The architecture is the part worth discussing, and I can " +
            "walk anyone through it.",
          "Hackathon scope means the evidence trail is append-only and unbounded. " +
            "Retention, partitioning and a real index strategy are the first three " +
            "things that would need to exist before anyone pointed live mail " +
            "volume at it.",
        ],
      },
      {
        heading: "What I'd change",
        body: [
          "The boundary between the service and the classifier is the thinnest " +
            "part. It should be an explicit interface with a contract test, so the " +
            "model can be swapped, versioned, or run remotely without the API " +
            "layer knowing — and so a prediction can be traced back to the exact " +
            "model version that produced it.",
          "Test coverage was written to protect the integration points, which was " +
            "the right priority under a deadline and is not sufficient outside " +
            "one.",
        ],
      },
    ],
  },
  {
    slug: "site-auditor",
    name: "site-auditor",
    kind: "system",
    summary:
      "Concurrent crawler and link-health checker built around bounded, deliberately polite concurrency.",
    overview:
      "An async crawler that walks a site, checks every link it finds, and " +
      "reports what is broken — written to be well-behaved rather than fast. " +
      "The interesting constraints are all limits: how many requests at once, " +
      "how close together per host, what to retry, and what the site has asked " +
      "you not to touch.",
    year: "2026",
    status: "active",
    stack: ["Python 3.12", "asyncio", "httpx", "mypy --strict", "pytest", "ruff"],
    repo: "https://github.com/subham-hq/site-auditor",
    featured: true,
    facts: [
      {
        key: "Client",
        value: "One pooled httpx.AsyncClient with explicit connection limits",
      },
      {
        key: "Politeness",
        value: "Per-host request spacing; robots.txt parsed, not assumed",
      },
      {
        key: "Retries",
        value: "Exponential backoff with jitter, expressed as policy data",
      },
      {
        key: "Interfaces",
        value: "Fetcher Protocol — satisfied structurally, not by inheritance",
      },
      { key: "Gate", value: "mypy --strict and ruff, green CI" },
      {
        key: "Status",
        value: "Async network layer complete; analysis stage in progress",
      },
    ],
    sections: [
      {
        heading: "Problem",
        body: [
          "A crawler is the standard first async project because the naive version " +
            "is twenty lines. The naive version is also indistinguishable from a " +
            "denial-of-service attempt: unbounded concurrency, no spacing, no " +
            "robots.txt, retries that hammer whatever just failed.",
          "So the exercise I actually wanted was the opposite one — build the " +
            "limits first and let throughput be whatever politeness leaves over.",
        ],
      },
      {
        heading: "Approach",
        body: [
          "One pooled httpx.AsyncClient for the whole run, with explicit " +
            "connection limits. Creating a client per request is the common error: " +
            "it throws away connection reuse and quietly opens as many sockets as " +
            "you have URLs. Reusing one makes the ceiling a number someone chose.",
          "Retries use exponential backoff with jitter, and the policy is data " +
            "rather than control flow. Without jitter, everything that failed " +
            "together retries together, and the retry storm is often worse than " +
            "the original failure. Passing it as data means the retry behaviour " +
            "can be tested without waiting out real delays.",
          "Per-host spacing and robots.txt are enforced in the fetch path, not " +
            "left to the caller — a politeness rule that depends on every call " +
            "site remembering it is not a rule.",
          "Fetching sits behind a Fetcher Protocol. Test doubles satisfy it " +
            "structurally, so the retry path is exercised against a real " +
            "failing-then-succeeding fetcher with no mocking library involved. " +
            "Structural typing is what makes that possible: the double never " +
            "imports or inherits from the thing it stands in for, so the test " +
            "cannot accidentally depend on the implementation.",
        ],
      },
      {
        heading: "Trade-offs",
        body: [
          "asyncio rather than threads. Crawling is I/O-bound almost end to end, " +
            "so the event loop holds far more in-flight requests per unit of " +
            "memory. The cost is that any CPU-bound analysis has to leave the loop " +
            "deliberately — which is why page analysis is designed for a process " +
            "pool rather than being awaited inline.",
          "mypy --strict from the first commit rather than added later. Retrofitting " +
            "types onto async code is materially harder than writing them: the " +
            "awaitable boundaries are exactly where the annotations matter, and " +
            "exactly where they are painful to reconstruct afterwards.",
        ],
      },
      {
        heading: "What's left",
        body: [
          "The network layer is done. The analysis stage — CPU-bound page checks " +
            "in a process pool — is in progress, and the report output is not " +
            "written yet. Listed here as active for that reason, rather than " +
            "presented as finished.",
        ],
      },
    ],
  },
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
    video: {
      id: "xvPRFuExpm0",
      title: "OrderFlow — multi-tenant order management walkthrough",
      caption: "Walkthrough — tenant isolation, roles and the order lifecycle",
    },
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
    featured: false,
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
