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

      <Section title="Contributions">
        {/* Rendered by GitHub, so it can never disagree with the profile. It is
            lazy-loaded and carries explicit dimensions, so it costs nothing
            above the fold and shifts nothing when it arrives. */}
        <div className="overflow-x-auto rounded-sm border border-rule p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://ghchart.rshah.org/0f7a72/${githubUser}`}
            alt={`GitHub contribution graph for ${githubUser}`}
            width={880}
            height={128}
            loading="lazy"
            decoding="async"
            className="min-w-[640px]"
          />
        </div>
        <div className="mt-8">
          <Button href={links.github} variant="outline" external>
            Full profile on GitHub
          </Button>
        </div>
      </Section>
    </div>
  );
}
