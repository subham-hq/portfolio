import type { Metadata } from "next";
import { FadeIn } from "@/components/motion";

import { ProjectRow } from "@/components/ProjectRow";
import { PageHeader, Section } from "@/components/primitives";
import { studyProjects, systemProjects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Backend projects by Subham Bhattacharya — multi-tenant systems, typed Python, and " +
    "the study repositories underneath them.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <div className="shell">
      <PageHeader
        eyebrow="Projects"
        title="One system. Four studies."
        lede={
          "OrderFlow is designed work: a multi-tenant architecture with the trade-offs " +
          "written up end to end. The study repositories are deliberate practice in " +
          "Python internals, C and graph algorithms, and they say so."
        }
      />

      <Section title="Systems" aside={`${systemProjects.length} project`}>
        <ul className="border-b border-rule">
          {systemProjects.map((project, i) => (
            <li key={project.slug}>
              <FadeIn delay={(i * 60) / 1000}>
                <ProjectRow
                  project={project}
                  position={i + 1}
                  total={systemProjects.length}
                />
              </FadeIn>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Studies" aside={`${studyProjects.length} repositories`}>
        <ul className="border-b border-rule">
          {studyProjects.map((project, i) => (
            <li key={project.slug}>
              <FadeIn delay={(i * 60) / 1000}>
                <ProjectRow
                  project={project}
                  position={i + 1}
                  total={studyProjects.length}
                />
              </FadeIn>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
