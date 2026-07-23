import type { Metadata } from "next";
import { FadeIn } from "@/components/motion";
import { notFound } from "next/navigation";
import Link from "next/link";

import { StateMachine } from "@/components/StateMachine";
import { Button, Section, SpecRow, Tag } from "@/components/primitives";
import { getProject, projects } from "@/content/projects";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Not found" };
  return {
    title: project.name,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: project.name, description: project.summary },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <div className="shell">
      <header className="py-band">
        <Link href="/projects" className="label link-underline">
          ← Work
        </Link>
        <p className="label mt-8">
          {project.kind === "system" ? "System" : "Study"} · {project.year} ·{" "}
          {project.status}
        </p>
        <h1 className="font-display mt-6 text-h1">{project.name}</h1>
        <p className="prose-measure mt-8 text-lead text-fg-muted">{project.overview}</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Button href={project.repo} external>
            Source
          </Button>
          {project.demo ? (
            <Button href={project.demo} variant="outline" external>
              Demo
            </Button>
          ) : null}
        </div>
      </header>

      <Section title="Stack">
        <div className="flex flex-wrap gap-2">
          {project.stack.map((s) => (
            <Tag key={s}>{s}</Tag>
          ))}
        </div>
      </Section>

      {/* The lifecycle diagram is specific to this system, so it lives on this
          system's page. */}
      {project.slug === "orderflow" ? (
        <Section title="Order lifecycle">
          <FadeIn>
            <StateMachine />
          </FadeIn>
        </Section>
      ) : null}

      {project.facts?.length ? (
        <Section title="Specification">
          <dl className="border-b border-rule">
            {project.facts.map((f) => (
              <SpecRow key={f.key} label={f.key}>
                {f.value}
              </SpecRow>
            ))}
          </dl>
        </Section>
      ) : null}

      {project.sections.length > 0 ? (
        project.sections.map((section) => (
          <Section key={section.heading} title={section.heading}>
            <FadeIn>
              <div className="prose-measure text-lead text-fg-muted">
                {section.body.map((p) => (
                  <p key={p.slice(0, 32)}>{p}</p>
                ))}
              </div>
            </FadeIn>
          </Section>
        ))
      ) : (
        /* Correct empty state: says what is here, what is missing, and where to
           go instead — rather than a decorative "coming soon" that wastes a click. */
        <Section title="Write-up">
          <div className="border border-dashed border-rule-strong p-8">
            <p className="font-display text-h3">No case study yet</p>
            <p className="prose-measure mt-3 text-fg-muted">
              This is a study repository — deliberate practice rather than a designed
              system, so there are no architecture trade-offs to write up. The code is on
              GitHub and the README explains how it is organised.
            </p>
            <div className="mt-6">
              <Button href={project.repo} variant="outline" external>
                Read the code
              </Button>
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}
