import type { Metadata } from "next";
import { FadeIn } from "@/components/motion";
import { RepoGrid } from "@/components/RepoCard";
import { PageHeader, Button, Section, SpecRow, Tag } from "@/components/primitives";
import {
  mergedCount,
  mergedProjectCount,
  openCount,
  upstream,
  type Contribution,
} from "@/content/open-source";
import { githubUser, links } from "@/content/site";
import { getGithubSnapshot } from "@/lib/github";
import { formatDay } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Open source",
  description:
    `Upstream contributions by Subham Bhattacharya — ${mergedCount} merged pull requests ` +
    `across ${mergedProjectCount} Python projects, plus public repositories and activity.`,
  alternates: { canonical: "/open-source" },
};

/**
 * Contributions lead; repositories follow.
 *
 * The ordering is the argument. A repository is a thing you decided to publish.
 * A merged pull request is a thing a maintainer of someone else's project read,
 * questioned, and accepted — which is the closest public proxy for "can work on
 * a codebase they did not write" that exists without a job title.
 *
 * Merged and in-review are separated rather than totalled. Overstating by one
 * row costs the credibility of every other row on the page.
 */
function ContributionEntry({ contribution: c }: { contribution: Contribution }) {
  const merged = c.state === "merged";

  return (
    <article className="grid gap-4 border-t border-rule py-8 md:grid-cols-[minmax(9rem,14vw)_1fr] md:gap-12">
      <div>
        <p className="label">{formatDay(c.date)}</p>
        <p
          className={
            merged
              ? "mono mt-1 text-micro text-signal"
              : "mono mt-1 text-micro text-fg-faint"
          }
        >
          {merged ? "Merged" : "In review"}
        </p>
      </div>

      <div className="min-w-0">
        <h4 className="font-display text-h3">
          <a
            href={c.url}
            target="_blank"
            rel="noreferrer noopener"
            className="transition-colors hover:text-signal"
          >
            {c.title}
            <span aria-hidden="true" className="ml-2 text-fg-faint">
              ↗
            </span>
          </a>
        </h4>

        <p className="mono mt-1 text-label text-fg-muted">
          PR #{c.number}
          {c.closes ? (
            <>
              {" · closes "}
              <a
                href={c.closes.url}
                target="_blank"
                rel="noreferrer noopener"
                className="link-underline"
              >
                {c.closes.label}
              </a>
            </>
          ) : null}
        </p>

        <p className="prose-measure mt-4 text-body text-fg-muted">{c.detail}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {c.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      </div>
    </article>
  );
}

export default async function OpenSourcePage() {
  const gh = await getGithubSnapshot();

  const languages = [...new Set(gh.repos.map((r) => r.language).filter(Boolean))];

  return (
    <div className="shell">
      <PageHeader
        eyebrow="Open source"
        title="Code a maintainer agreed to own."
        lede={
          `${mergedCount} pull requests merged into ${mergedProjectCount} Python projects ` +
          `other people depend on, ${openCount} more in review. Each one below states the ` +
          "defect, the fix, and why the distinction mattered — because the interesting " +
          "part of a contribution is never the diff size."
        }
      />

      <Section
        title="Contributions"
        aside={`${mergedCount} merged · ${openCount} in review`}
      >
        <div className="space-y-band">
          {upstream.map((project, pi) => (
            <FadeIn key={project.id} delay={pi * 0.06}>
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-display text-h2">
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="transition-colors hover:text-signal"
                    >
                      {project.name}
                    </a>
                  </h3>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mono link-underline text-label text-fg-faint"
                  >
                    {project.repo} ↗
                  </a>
                </div>
                <p className="prose-measure mt-2 text-body text-fg-muted">
                  {project.blurb}
                </p>

                <div className="mt-6 border-b border-rule">
                  {project.contributions.map((c) => (
                    <ContributionEntry key={c.number} contribution={c} />
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

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
