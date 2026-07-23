import { githubUser } from "@/content/site";

/**
 * GitHub data, fetched server-side.
 *
 * Design note — this is the failure case the whole site is arguing for, so it
 * is worth being explicit about it. The GitHub REST API rate-limits
 * unauthenticated requests to 60/hour *per IP*, and a build machine shares its
 * IP with everyone else on that host. So:
 *
 *   - a token is optional, never required
 *   - every request has a timeout
 *   - any failure returns committed snapshot data instead of throwing
 *
 * The page always renders. A degraded panel is a smaller problem than a build
 * that fails because a third party was busy.
 */

export interface Repo {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  updated: string;
}

export interface GithubSnapshot {
  repos: Repo[];
  publicRepos: number;
  followers: number;
  /** True when the data came from the API; false when it came from the fallback. */
  live: boolean;
}

/** Committed snapshot. Keep it roughly accurate; it is what users see if the
 *  API is unreachable. */
const FALLBACK: GithubSnapshot = {
  repos: [
    {
      name: "orderflow",
      description: "Multi-tenant B2B order management system built with Flask.",
      url: "https://github.com/subham-hq/orderflow",
      language: "Python",
      stars: 0,
      updated: "2026-01-15T00:00:00Z",
    },
    {
      name: "python-deep-dive",
      description: "From-scratch implementations of core Python internals.",
      url: "https://github.com/subham-hq/python-deep-dive",
      language: "Python",
      stars: 0,
      updated: "2026-07-01T00:00:00Z",
    },
    {
      name: "leetcode-solutions",
      description: "Algorithm practice with written reasoning.",
      url: "https://github.com/subham-hq/leetcode-solutions",
      language: "Python",
      stars: 0,
      updated: "2026-06-20T00:00:00Z",
    },
    {
      name: "c-programming-fundamental",
      description: "C fundamentals — memory, pointers, and cost models.",
      url: "https://github.com/subham-hq/c-programming-fundamental",
      language: "C",
      stars: 0,
      updated: "2026-05-10T00:00:00Z",
    },
  ],
  publicRepos: 5,
  followers: 0,
  live: false,
};

const API = "https://api.github.com";
const TIMEOUT_MS = 4000;

function headers(): HeadersInit {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

async function get<T>(path: string): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API}${path}`, {
      headers: headers(),
      signal: controller.signal,
      // Revalidate hourly. Repository metadata does not need to be fresher than
      // that, and this keeps us well inside the unauthenticated rate limit.
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

interface RawRepo {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
}

interface RawUser {
  public_repos: number;
  followers: number;
}

export async function getGithubSnapshot(): Promise<GithubSnapshot> {
  const [rawRepos, user] = await Promise.all([
    get<RawRepo[]>(`/users/${githubUser}/repos?per_page=100&sort=pushed`),
    get<RawUser>(`/users/${githubUser}`),
  ]);

  if (!rawRepos) return FALLBACK;

  const repos: Repo[] = rawRepos
    .filter((r) => !r.fork)
    .slice(0, 6)
    .map((r) => ({
      name: r.name,
      description: r.description,
      url: r.html_url,
      language: r.language,
      stars: r.stargazers_count,
      updated: r.pushed_at,
    }));

  return {
    repos,
    publicRepos: user?.public_repos ?? repos.length,
    followers: user?.followers ?? 0,
    live: true,
  };
}

/** Rough relative time. Avoids pulling in a date library for one string. */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
