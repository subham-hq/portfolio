import type { Metadata } from "next";
import { RepoGrid } from "@/components/RepoCard";
import { PageHeader, Button, Section, SpecRow } from "@/components/primitives";
import { githubUser, links } from "@/content/site";
import { getGithubSnapshot } from "@/lib/github";

export const metadata: Metadata = {
  title: "Open source",
  description:
    "Public repositories, languages and recent activity for Subham Bhattacharya on GitHub.",
  alternates: { canonical: "/open-source" },
};

/** Hourly. Repository metadata does not need to be fresher, and this keeps the
 *  site comfortably inside GitHub's unauthenticated rate limit. */

export default async function OpenSourcePage() {
  const gh = await getGithubSnapshot();

  const languages = [...new Set(gh.repos.map((r) => r.language).filter(Boolean))];

  return (
    <div className="shell">
      <PageHeader
        eyebrow="Open source"
        title="Everything here is meant to be read."
        lede={
          "Clean repositories, documentation written to be read, and commit histories " +
          "that make sense. Where something is coursework, it says so."
        }
      />

      <Section title="Profile" aside={gh.live ? "Live" : "Cached snapshot"}>
        <dl className="border-b border-rule">
          <SpecRow label="Handle">
            <a
              href={links.github}
              className="link-underline mono"
              target="_blank"
              rel="noreferrer noopener"
            >
              {githubUser} ↗
            </a>
          </SpecRow>
          <SpecRow label="Public repos">{gh.publicRepos}</SpecRow>
          <SpecRow label="Followers">{gh.followers}</SpecRow>
          <SpecRow label="Languages">{languages.join(" · ") || "—"}</SpecRow>
        </dl>
      </Section>

      <Section title="Repositories">
        <RepoGrid repos={gh.repos} />

        {!gh.live ? (
          <p className="label mt-6">
            Live data unavailable — showing the committed snapshot. Set GITHUB_TOKEN to
            enable live repository data.
          </p>
        ) : null}
      </Section>

      {/* This page is the repository list. Contribution data — the graph, the
          language breakdown, the streak — lives on /github, which builds it
          from the API at deploy time.

          What used to be here was an <img> pointing at ghchart.rshah.org. That
          stopped rendering the moment the CSP tightened: with no `img-src`
          directive, images fall back to `default-src 'self'`, and a
          third-party host is not 'self'. Rather than re-open the policy for a
          service outside your control, the page now points at the first-party
          version — which is also one canonical place for this data instead of
          two that can drift apart.

          This mirrors /github, which points here for the repositories. */}
      <Section title="Activity">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <p className="prose-measure text-lead text-fg-muted">
            The contribution graph, language breakdown and streak are on the GitHub stats
            page, built from the API at deploy time rather than embedded from a third
            party.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button href="/github">GitHub stats</Button>
            <Button href={links.github} variant="outline" external>
              Full profile
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
