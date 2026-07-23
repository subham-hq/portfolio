#!/usr/bin/env node
/**
 * Build-time GitHub stats.
 *
 * Runs before `next build` and writes src/content/github-stats.json. The site
 * is a static export, so the numbers bake into the HTML — nothing is fetched
 * in the browser, no third-party image host can take the section down, and
 * there is no runtime dependency on GitHub being up.
 *
 * The data is a snapshot. A scheduled deploy hook rebuilds it daily, and the
 * page prints the generation date so a stale build is visible rather than
 * silent.
 *
 * Failure never breaks the build: an existing JSON file is left in place and
 * the run warns loudly. Only a first run with no file writes an empty shell.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const LOGIN = process.env.GITHUB_LOGIN ?? "subham-hq";
const TOKEN = process.env.GITHUB_TOKEN;
const OUT = path.join(process.cwd(), "src", "content", "github-stats.json");

const TOP_LANGUAGES = 6;
const CALENDAR_DAYS = 371; // 53 weeks, the width of the heatmap

const API = "https://api.github.com/graphql";

const PROFILE_QUERY = `
query ($login: String!, $cursor: String) {
  user(login: $login) {
    createdAt
    followers { totalCount }
    repositories(
      first: 100
      after: $cursor
      ownerAffiliations: OWNER
      isFork: false
      privacy: PUBLIC
    ) {
      totalCount
      pageInfo { hasNextPage endCursor }
      nodes {
        stargazerCount
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          edges {
            size
            node { name color }
          }
        }
      }
    }
  }
}`;

const CONTRIBUTIONS_QUERY = `
query ($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      totalPullRequestReviewContributions
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays { date contributionCount }
        }
      }
    }
  }
}`;

async function graphql(query, variables) {
  const response = await fetch(API, {
    method: "POST",
    headers: {
      Authorization: `bearer ${TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": `${LOGIN}-portfolio-build`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
  }

  const body = await response.json();
  if (body.errors?.length) {
    throw new Error(body.errors.map((e) => e.message).join("; "));
  }
  return body.data;
}

/** contributionsCollection accepts at most a one-year span, so an account
 *  older than that has to be walked a year at a time. */
function yearWindows(createdAt, now) {
  const windows = [];
  let from = new Date(createdAt);

  while (from < now) {
    const to = new Date(from);
    to.setUTCFullYear(to.getUTCFullYear() + 1);
    windows.push({
      from: from.toISOString(),
      to: (to > now ? now : to).toISOString(),
    });
    from = to;
  }
  return windows;
}

function computeStreaks(days) {
  let longest = { days: 0, start: null, end: null };
  let run = 0;
  let runStart = null;

  for (const day of days) {
    if (day.count > 0) {
      if (run === 0) runStart = day.date;
      run += 1;
      if (run > longest.days) {
        longest = { days: run, start: runStart, end: day.date };
      }
    } else {
      run = 0;
    }
  }

  // Walk backwards for the current streak. The calendar always ends on the
  // current day, so an empty final day is today with nothing logged yet — that
  // does not end a streak. Deliberately no comparison against the local clock:
  // GitHub's calendar is UTC and the build machine may be a day off, which
  // would drop a live streak to zero.
  let i = days.length - 1;
  if (i >= 0 && days[i].count === 0) i -= 1;

  const current = { days: 0, start: null, end: null };
  while (i >= 0 && days[i].count > 0) {
    if (current.days === 0) current.end = days[i].date;
    current.days += 1;
    current.start = days[i].date;
    i -= 1;
  }

  return { current, longest };
}

function levelFor(count, max) {
  if (count === 0) return 0;
  const ratio = count / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

function topLanguages(totals) {
  const overall = Object.values(totals).reduce((sum, l) => sum + l.size, 0);
  if (overall === 0) return [];

  const sorted = Object.values(totals).sort((a, b) => b.size - a.size);
  const top = sorted.slice(0, TOP_LANGUAGES).map((l) => ({
    name: l.name,
    color: l.color ?? "#8b949e",
    percent: Number(((l.size / overall) * 100).toFixed(1)),
  }));

  const rest = sorted.slice(TOP_LANGUAGES).reduce((sum, l) => sum + l.size, 0);
  if (rest > 0) {
    top.push({
      name: "Other",
      color: "#8b949e",
      percent: Number(((rest / overall) * 100).toFixed(1)),
    });
  }
  return top;
}

async function collect() {
  const languageTotals = {};
  let stars = 0;
  let publicRepos = 0;
  let followers = 0;
  let createdAt = null;
  let cursor = null;

  do {
    const data = await graphql(PROFILE_QUERY, { login: LOGIN, cursor });
    const user = data.user;
    if (!user) throw new Error(`No such GitHub user: ${LOGIN}`);

    createdAt ??= user.createdAt;
    followers = user.followers.totalCount;
    publicRepos = user.repositories.totalCount;

    for (const repo of user.repositories.nodes) {
      stars += repo.stargazerCount;
      for (const edge of repo.languages.edges) {
        const key = edge.node.name;
        languageTotals[key] ??= { name: key, color: edge.node.color, size: 0 };
        languageTotals[key].size += edge.size;
      }
    }

    cursor = user.repositories.pageInfo.hasNextPage
      ? user.repositories.pageInfo.endCursor
      : null;
  } while (cursor);

  const now = new Date();
  const windows = yearWindows(createdAt, now);

  const totals = { contributions: 0, commits: 0, pullRequests: 0, issues: 0, reviews: 0 };
  const dayMap = new Map();

  for (const window of windows) {
    const data = await graphql(CONTRIBUTIONS_QUERY, { login: LOGIN, ...window });
    const c = data.user.contributionsCollection;

    totals.commits += c.totalCommitContributions;
    totals.pullRequests += c.totalPullRequestContributions;
    totals.issues += c.totalIssueContributions;
    totals.reviews += c.totalPullRequestReviewContributions;
    totals.contributions += c.contributionCalendar.totalContributions;

    for (const week of c.contributionCalendar.weeks) {
      for (const day of week.contributionDays) {
        // Windows share a boundary date, so last write wins rather than double
        // counting.
        dayMap.set(day.date, day.contributionCount);
      }
    }
  }

  const days = [...dayMap.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const { current, longest } = computeStreaks(days);

  const recent = days.slice(-CALENDAR_DAYS);
  const max = Math.max(1, ...recent.map((d) => d.count));

  return {
    ok: true,
    generatedAt: now.toISOString(),
    login: LOGIN,
    stats: {
      followers,
      publicRepos,
      stars,
      commits: totals.commits,
      pullRequests: totals.pullRequests,
      issues: totals.issues,
      reviews: totals.reviews,
    },
    languages: topLanguages(languageTotals),
    contributions: {
      total: totals.contributions,
      currentStreak: current,
      longestStreak: longest,
      calendar: recent.map((d) => ({
        date: d.date,
        count: d.count,
        level: levelFor(d.count, max),
      })),
    },
  };
}

const EMPTY = {
  ok: false,
  generatedAt: null,
  login: LOGIN,
  stats: {
    followers: 0,
    publicRepos: 0,
    stars: 0,
    commits: 0,
    pullRequests: 0,
    issues: 0,
    reviews: 0,
  },
  languages: [],
  contributions: {
    total: 0,
    currentStreak: { days: 0, start: null, end: null },
    longestStreak: { days: 0, start: null, end: null },
    calendar: [],
  },
};

async function main() {
  if (!TOKEN) throw new Error("GITHUB_TOKEN is not set");

  const payload = await collect();
  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(
    `github-stats: ${payload.contributions.total} contributions, ` +
      `${payload.stats.stars} stars, ${payload.languages.length} languages`,
  );
}

main().catch(async (error) => {
  console.warn("\n  github-stats: fetch failed —", error.message);

  if (existsSync(OUT)) {
    const previous = JSON.parse(await readFile(OUT, "utf8"));
    console.warn(`  Keeping the existing snapshot from ${previous.generatedAt}.`);
    console.warn("  The page will show that date. Fix the token before it drifts.\n");
    return;
  }

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, `${JSON.stringify(EMPTY, null, 2)}\n`, "utf8");
  console.warn("  No previous snapshot — wrote an empty one. The section will not render.\n");
});
