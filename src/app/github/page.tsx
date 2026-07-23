import { GitHubStatPanels, ContributionHeatmap } from "@/components/GitHubStats";
import type { Metadata } from "next";
import { Button, PageHeader, Section, SpecRow } from "@/components/primitives";
import { githubUser, links, person } from "@/content/site";
import { getGithubSnapshot, relativeTime } from "@/lib/github";

export const metadata: Metadata = {
  title: "GitHub",
  description: `GitHub statistics, language breakdown and contribution activity for ${person.name}.`,
  alternates: { canonical: "/github" },
};


export default async function GithubPage() {
  const gh = await getGithubSnapshot();
  const languages = [...new Set(gh.repos.map((r) => r.language).filter(Boolean))];
  const mostRecent = gh.repos[0];

  return (
    <div className="shell">
      <PageHeader
        eyebrow="GitHub"
        title="The activity behind the projects."
        lede={
          "Repository activity, language breakdown and contribution history, built " +
          "from the GitHub API at deploy time."
        }
      />

      <Section title="Profile" aside={gh.live ? "Live" : "Cached snapshot"}>
        <dl className="border-b border-rule">
          <SpecRow label="Handle">
            <a
              href={links.github}
              target="_blank"
              rel="noreferrer noopener"
              className="link-underline mono"
            >
              {githubUser} ↗
            </a>
          </SpecRow>
          <SpecRow label="Public repos">{gh.publicRepos}</SpecRow>
          <SpecRow label="Followers">{gh.followers}</SpecRow>
          <SpecRow label="Languages">{languages.join(" · ") || "—"}</SpecRow>
          <SpecRow label="Last push">
            {mostRecent
              ? `${mostRecent.name} · ${relativeTime(mostRecent.updated)}`
              : "—"}
          </SpecRow>
        </dl>
      </Section>

      <Section title="Contribution graph">
        <ContributionHeatmap />
      </Section>

      <Section title="Statistics" aside="Built at deploy time">
        <GitHubStatPanels />
      </Section>

      <Section title="Repositories">
        {/* This page is statistics. The repositories themselves live on
            /open-source — one canonical list, not two that can disagree. */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <p className="prose-measure text-lead text-fg-muted">
            The repositories, with descriptions and what each one is for, are on the open
            source page.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button href="/open-source">Browse repositories</Button>
            <Button href={links.github} variant="outline" external>
              Full profile
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
