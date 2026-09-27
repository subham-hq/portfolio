/**
 * Upstream contributions.
 *
 * This file exists because a repository list is not the same claim as a merged
 * pull request. Anyone can publish a repository; a merged PR means a maintainer
 * of a project they did not have to be polite about read the diff and took it.
 *
 * Two rules for editing:
 *
 *   1. `state` is checked against GitHub, not against memory. A PR listed as
 *      merged that a reviewer opens and finds open is worse than omitting it —
 *      it invalidates everything else on the page. Open work is listed as open.
 *   2. `detail` states the defect, the fix, and why the distinction mattered.
 *      "Fixed a bug" is not a contribution record; it is a commit message.
 */

export type ContributionState = "merged" | "open";

export interface Contribution {
  /** PR number, unique within a repo. */
  number: number;
  title: string;
  url: string;
  state: ContributionState;
  /** ISO date. Merge date for merged work, opened date for work in review. */
  date: string;
  /** Defect → fix → why it mattered. Two or three sentences. */
  detail: string;
  closes?: { label: string; url: string };
  tags: string[];
}

export interface UpstreamProject {
  id: string;
  name: string;
  repo: string;
  url: string;
  /** One line: what the project is, for a reader who has not heard of it. */
  blurb: string;
  contributions: Contribution[];
}

export const upstream: UpstreamProject[] = [
  {
    id: "litestar",
    name: "Litestar",
    repo: "litestar-org/litestar",
    url: "https://github.com/litestar-org/litestar",
    blurb: "Light, flexible and extensible ASGI framework for Python.",
    contributions: [
      {
        number: 4990,
        title: "Return 413 when the multipart form part limit is exceeded",
        url: "https://github.com/litestar-org/litestar/pull/4990",
        state: "merged",
        date: "2026-08-15",
        detail:
          "A multipart upload that exceeded the configured part limit was rejected " +
          "with 400 Bad Request. 400 tells a client its request was malformed, so a " +
          "client that had sent a perfectly well-formed upload — just a large one — " +
          "could not tell the two cases apart, and no retry or chunking strategy " +
          "could be written against it. Limit violations now return 413 Request " +
          "Entity Too Large while genuinely malformed bodies keep 400, and files " +
          "already written to disk are still cleaned up on the error path. Shipped " +
          "with regression tests, a changelog entry and a breaking-change note.",
        closes: {
          label: "#4439",
          url: "https://github.com/litestar-org/litestar/issues/4439",
        },
        tags: ["HTTP semantics", "ASGI", "Multipart", "Breaking change", "pytest"],
      },
    ],
  },
  {
    id: "strawberry",
    name: "Strawberry GraphQL",
    repo: "strawberry-graphql/strawberry",
    url: "https://github.com/strawberry-graphql/strawberry",
    blurb: "GraphQL library for Python, built on type hints and dataclasses.",
    contributions: [
      {
        number: 4591,
        title: "Correct the dataclass_transform ordering metadata",
        url: "https://github.com/strawberry-graphql/strawberry/pull/4591",
        state: "merged",
        date: "2026-08-30",
        detail:
          "Strawberry's decorators declared order_default=True in their PEP 681 " +
          "dataclass_transform metadata, which promises a type checker that ordering " +
          "methods will be generated. At runtime Strawberry wraps dataclasses with " +
          "ordering disabled. Static and runtime behaviour disagreed, and the cost " +
          "landed on users: mypy rejected valid hand-written __lt__ and __gt__ " +
          "implementations on Strawberry types. Corrected to order_default=False " +
          "across the core, federation and schema-directive decorators, with " +
          "regression coverage on each.",
        tags: ["PEP 681", "Type system", "mypy", "Dataclasses", "GraphQL"],
      },
      {
        number: 4581,
        title: "Make the resolver documentation examples self-contained",
        url: "https://github.com/strawberry-graphql/strawberry/pull/4581",
        state: "merged",
        date: "2026-08-29",
        detail:
          "Two resolver examples depended on a type defined earlier on the page, so " +
          "copying either one into a file raised NameError — the first thing a new " +
          "user does with a documentation snippet is run it. Both examples now carry " +
          "their own import and type definition and execute standalone.",
        tags: ["Documentation", "Developer experience"],
      },
    ],
  },
  {
    id: "ianvs",
    name: "KubeEdge Ianvs",
    repo: "kubeedge/ianvs",
    url: "https://github.com/kubeedge/ianvs",
    blurb:
      "CNCF distributed synergy AI benchmarking framework for edge–cloud collaborative learning.",
    contributions: [
      {
        number: 758,
        title: "Warn on deprecated and unknown dataset config fields",
        url: "https://github.com/kubeedge/ianvs/pull/758",
        state: "open",
        date: "2026-08-12",
        detail:
          "The dataset config parser accepted arbitrary keys. A mistyped " +
          "incremental_round was stored and ignored while incremental_rounds quietly " +
          "kept its default and passed validation, so the run failed much later with " +
          "an error naming three keys the user had never written and saying nothing " +
          "about the one they had. Adds warnings for deprecated train_url / test_url " +
          "inputs and for unrecognised keys, moving the diagnostic to parse time. " +
          "Backward compatible — valid configurations are unaffected.",
        tags: ["Configuration", "Failure modes", "Diagnostics", "Backward compatible"],
      },
      {
        number: 756,
        title: "Correct the filename in the Data Info File error message",
        url: "https://github.com/kubeedge/ianvs/pull/756",
        state: "open",
        date: "2026-08-11",
        detail:
          "The loader raised an error instructing the user to name their file " +
          "data_info.json, while the format check only recognised metadata.json. " +
          "Following the error message reproduced the same error exactly — an error " +
          "message that costs more time than no error message. Renamed to the file " +
          "the loader actually looks for.",
        tags: ["Error messages", "Developer experience"],
      },
    ],
  },
];

export const allContributions = upstream.flatMap((p) =>
  p.contributions.map((c) => ({ ...c, project: p.name, projectUrl: p.url })),
);

export const mergedCount = allContributions.filter((c) => c.state === "merged").length;
export const openCount = allContributions.filter((c) => c.state === "open").length;
export const projectCount = upstream.length;

/** Projects with at least one merged contribution. Used wherever the claim is
 *  "merged into N projects" — open work does not count toward it. */
export const mergedProjectCount = upstream.filter((p) =>
  p.contributions.some((c) => c.state === "merged"),
).length;
