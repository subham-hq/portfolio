import type { Repo } from "@/lib/github";
import { Spotlight } from "./effects";
import { relativeTime } from "@/lib/github";

/**
 * Extracted because this markup was duplicated across three routes — the
 * index, /open-source and /github — and had already drifted between them.
 * One definition, one place to change the hover treatment.
 */
export function RepoCard({ repo }: { repo: Repo }) {
  return (
    <Spotlight className="spotlight surface flex w-full">
      <a
        href={repo.url}
        target="_blank"
        rel="noreferrer noopener"
        className="group flex w-full flex-col p-6"
      >
        <span className="mono text-body transition-colors group-hover:text-signal">
          {repo.name}
        </span>
        <span className="mt-2 flex-1 text-body text-fg-muted">
          {repo.description ?? "No description."}
        </span>
        <span className="label mt-5 flex items-center gap-3">
          {repo.language ? <span>{repo.language}</span> : null}
          {repo.language ? <span aria-hidden="true">·</span> : null}
          <span>updated {relativeTime(repo.updated)}</span>
        </span>
      </a>
    </Spotlight>
  );
}

export function RepoGrid({ repos }: { repos: Repo[] }) {
  return (
    <ul className="grid gap-px bg-rule sm:grid-cols-2">
      {repos.map((repo) => (
        <li key={repo.name} className="surface flex">
          <RepoCard repo={repo} />
        </li>
      ))}
    </ul>
  );
}
