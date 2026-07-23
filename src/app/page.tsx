import Link from "next/link";
import { Faq } from "@/components/Faq";
import { Figures } from "@/components/Figures";
import { ProjectRow } from "@/components/ProjectRow";
import { RepoGrid } from "@/components/RepoCard";
import { Hero3D } from "@/components/Hero3D";
import { Parallax } from "@/components/effects";
import { SectionRail } from "@/components/SectionRail";
import { Testimonials } from "@/components/Testimonials";
import { FadeIn, Magnetic, Marquee, TextReveal } from "@/components/motion";
import { Button, Section, SpecRow } from "@/components/primitives";
import { featuredProjects } from "@/content/projects";
import { credentials, roadmap, skills } from "@/content/records";
import { bio, disciplines, links, now, person, vitals } from "@/content/site";
import { getGithubSnapshot } from "@/lib/github";
import { formatMonth } from "@/lib/utils";

const approach = [
  {
    n: "A",
    title: "Failure modes before features",
    body:
      "I map what breaks a system, what happens when it does, and whether it breaks " +
      "loudly, before I write the happy path. Four years of manufacturing taught me " +
      "that the quiet failure is the expensive one.",
  },
  {
    n: "B",
    title: "Depth over collection",
    body:
      "One stack understood well enough to defend every trade-off out loud beats a " +
      "list of frameworks touched once. Breadth arrives faster from a real " +
      "foundation than from a wider surface.",
  },
  {
    n: "C",
    title: "Written to be read",
    body:
      "Every system has a second reader, usually a later version of me. Clean " +
      "repositories and honest documentation are part of the engineering, not " +
      "paperwork filed after it.",
  },
];

export default async function HomePage() {
  const gh = await getGithubSnapshot();
  const coreSkills = skills.flatMap((g) =>
    g.items.filter((i) => i.depth === "core").map((i) => i.name),
  );

  return (
    <>
      <SectionRail />

      {/* ═══ 00 · INTRO ═══════════════════════════════════════════════════ */}
      <section id="intro" className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="grid-field pointer-events-none absolute inset-0 opacity-50"
        />

        <div className="shell relative pt-10 pb-12 sm:pt-16 lg:pt-24 lg:pb-14">
          <div className="grid items-center gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:gap-14">
            {/* Mobile order is deliberate and differs from desktop: heading,
                lede, actions, then the graphic. Previously the 280px scene was
                first in flow, which pushed the h1 most of the way down an
                iPhone SE viewport — the most important sentence on the site
                was effectively below the fold. On lg the two sit side by side
                and the visual order is restored. */}
            <div>
              <FadeIn>
                <p className="label flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className="inline-flex items-center gap-2 text-signal">
                    <span
                      aria-hidden="true"
                      className="inline-block size-1.5 rounded-full bg-signal"
                    />
                    Available for work
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{person.location}</span>
                  <span aria-hidden="true" className="hidden sm:inline">
                    ·
                  </span>
                  <span className="hidden sm:inline">{person.utcOffset}</span>
                </p>
              </FadeIn>

              <TextReveal
                as="h1"
                text={bio.headline}
                delay={0.1}
                className="font-display mt-6 text-h1"
              />

              <FadeIn delay={0.35}>
                <p className="prose-measure mt-6 text-lead text-fg-muted sm:mt-8">
                  {bio.lede}
                </p>

                {/* Full-width stacked actions below 640px: a wide target in the
                    thumb zone beats three small ones wrapping unpredictably. */}
                <div className="mt-8 grid gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
                  <Magnetic>
                    <Button href="/projects" fullWidth>
                      See the work
                    </Button>
                  </Magnetic>
                  <Magnetic>
                    <Button href="/contact" variant="outline" fullWidth>
                      Get in touch
                    </Button>
                  </Magnetic>
                  <Magnetic>
                    <Button href={links.resume} variant="outline" external fullWidth>
                      Résumé
                    </Button>
                  </Magnetic>
                </div>
              </FadeIn>
            </div>

            <Parallax speed={0.1} className="mt-2 lg:mt-0">
              <Hero3D />
            </Parallax>
          </div>
        </div>

        <div className="shell relative">
          <Figures />
        </div>
      </section>

      <Marquee items={disciplines} />

      <div className="shell">
        {/* ═══ 01 · VITALS ════════════════════════════════════════════════ */}
        <Section
          id="vitals"
          title="01 — Vitals"
          aside={`Updated ${formatMonth(now.updated)}`}
        >
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <dl className="border-b border-rule">
              {vitals.map((vital) => (
                <SpecRow key={vital.key} label={vital.key}>
                  <span className="block text-lead">{vital.value}</span>
                  <span className="mono mt-1 block text-label text-fg-faint">
                    {vital.detail}
                  </span>
                </SpecRow>
              ))}
            </dl>

            <div>
              <p className="label mb-6">Now</p>
              <dl className="border-b border-rule">
                {now.entries.map((entry) => (
                  <SpecRow key={entry.key} label={entry.key}>
                    <span className="block text-lead">{entry.label}</span>
                    <span className="mono mt-1 block text-label text-fg-faint">
                      {entry.detail}
                    </span>
                  </SpecRow>
                ))}
              </dl>
            </div>
          </div>
        </Section>

        {/* ═══ 02 · APPROACH ══════════════════════════════════════════════ */}
        <Section id="approach" title="02 — Approach">
          <TextReveal
            as="h3"
            text="Operations taught me what breaks. Engineering is where I stop it breaking."
            className="font-display mb-12 text-h2 max-w-[20ch]"
          />
          <ol className="grid gap-px bg-rule md:grid-cols-3">
            {approach.map((item, i) => (
              <li key={item.n} className="surface p-7">
                <FadeIn delay={i * 0.08}>
                  <span className="mono text-micro text-signal">{item.n}</span>
                  <h4 className="font-display mt-5 text-h3">{item.title}</h4>
                  <p className="mt-3 text-body text-fg-muted">{item.body}</p>
                </FadeIn>
              </li>
            ))}
          </ol>
        </Section>

        {/* ═══ 03 · WORK ══════════════════════════════════════════════════ */}
        <Section
          id="work"
          title="03 — Selected work"
          aside={
            <Link href="/projects" className="link-underline hover:text-fg">
              All projects →
            </Link>
          }
        >
          <ul className="border-b border-rule">
            {featuredProjects.map((project, i) => (
              <li key={project.slug}>
                <FadeIn delay={i * 0.07}>
                  <ProjectRow
                    project={project}
                    position={i + 1}
                    total={featuredProjects.length}
                    maxTags={5}
                  />
                </FadeIn>
              </li>
            ))}
          </ul>
        </Section>

        {/* ═══ 04 · TRAJECTORY ════════════════════════════════════════════ */}
        <Section
          id="trajectory"
          title="04 — Trajectory"
          aside={
            <Link href="/ai-journey" className="link-underline hover:text-fg">
              Full roadmap →
            </Link>
          }
        >
          <ol className="grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-4">
            {roadmap.map((stage, i) => (
              <li key={stage.phase} className="surface p-6">
                <FadeIn delay={i * 0.07}>
                  <div className="flex items-center justify-between">
                    <span className="mono text-micro text-fg-faint">{stage.phase}</span>
                    <span
                      className={
                        stage.state === "current" ? "label !text-signal" : "label"
                      }
                    >
                      {stage.state === "done"
                        ? "Complete"
                        : stage.state === "current"
                          ? "In progress"
                          : "Planned"}
                    </span>
                  </div>
                  <h3 className="font-display mt-5 text-h3">{stage.title}</h3>
                  <p className="mt-3 text-body text-fg-muted">{stage.detail}</p>
                </FadeIn>
              </li>
            ))}
          </ol>
        </Section>

        {/* ═══ 05 · STACK ═════════════════════════════════════════════════ */}
        <Section
          id="stack"
          title="05 — Stack"
          aside={
            <Link href="/tech-stack" className="link-underline hover:text-fg">
              Full stack →
            </Link>
          }
        >
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
            <div>
              <p className="label mb-4">Core — I defend design decisions in these</p>
              <div className="flex flex-wrap gap-2">
                {coreSkills.map((s) => (
                  <span
                    key={s}
                    className="mono rounded-sm border border-signal/40 px-3 py-1 text-label text-signal"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <dl className="border-b border-rule">
              {skills.map((group) => (
                <SpecRow key={group.group} label={group.group}>
                  {group.items.map((i) => i.name).join(" · ")}
                </SpecRow>
              ))}
            </dl>
          </div>
        </Section>

        {/* ═══ 06 · CREDENTIALS ═══════════════════════════════════════════ */}
        <Section
          id="credentials"
          title="06 — Credentials"
          aside={
            <Link href="/certifications" className="link-underline hover:text-fg">
              All certifications →
            </Link>
          }
        >
          <ul className="grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-3">
            {credentials.slice(0, 3).map((c, i) => (
              <li key={c.url} className="surface flex">
                <FadeIn delay={i * 0.07} className="flex w-full">
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex w-full flex-col p-6 transition-colors hover:bg-bg-sunken"
                  >
                    <span className="label">{formatMonth(c.issued)}</span>
                    <span className="font-display mt-4 flex-1 text-h3 transition-colors group-hover:text-signal">
                      {c.title}
                    </span>
                    <span className="mono mt-3 text-label text-fg-muted">{c.issuer}</span>
                    {c.grade ? (
                      <span className="mono mt-1 text-micro text-signal">{c.grade}</span>
                    ) : null}
                  </a>
                </FadeIn>
              </li>
            ))}
          </ul>
        </Section>

        {/* ═══ 07 · REPOSITORIES ══════════════════════════════════════════ */}
        <Section
          id="repositories"
          title="07 — Repositories"
          aside={
            <Link href="/open-source" className="link-underline hover:text-fg">
              {gh.live ? `${gh.publicRepos} public` : "Cached"} →
            </Link>
          }
        >
          <RepoGrid repos={gh.repos.slice(0, 4)} />
        </Section>

        {/* ═══ 08 · QUESTIONS ═════════════════════════════════════════════ */}
        <Section id="questions" title="08 — Questions" aside="The ones that come up most">
          <Faq />
        </Section>

        {/* ═══ 09 · REFERENCES ════════════════════════════════════════════ */}
        <Section id="references" title="09 — References">
          <Testimonials />
        </Section>

        {/* ═══ 10 · CONTACT ═══════════════════════════════════════════════ */}
        <Section id="contact" title="10 — Contact">
          <div className="flex flex-wrap items-end justify-between gap-10">
            <TextReveal
              as="h3"
              text="Hiring for a backend or platform role? Let's talk."
              className="font-display text-h2 max-w-[18ch]"
            />
            <div className="flex flex-wrap gap-3">
              <Magnetic>
                <Button href="/contact">Send a message</Button>
              </Magnetic>
              <Magnetic>
                <Button href={links.github} variant="outline" external>
                  GitHub
                </Button>
              </Magnetic>
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
