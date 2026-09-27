import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn, TextReveal } from "@/components/motion";
import { Button, PageHeader, Section, Tag } from "@/components/primitives";
import { aiTrajectory, roadmap } from "@/content/records";
import { mergedCount } from "@/content/open-source";
import { cx } from "@/lib/utils";

export const metadata: Metadata = {
  title: "AI journey",
  description:
    "The route from C and fundamentals through backend engineering to AI/ML systems — " +
    "with the evidence for each stage, and the stages that are still only intent.",
  alternates: { canonical: "/ai-journey" },
};

const STATE_LABEL = {
  done: "Complete",
  current: "In progress",
  next: "Planned",
} as const;

const MILESTONE_LABEL = {
  shipped: "Shipped",
  active: "In progress",
  planned: "Not started",
} as const;

const MILESTONE_STYLE = {
  shipped: "text-signal",
  active: "text-signal",
  planned: "text-fg-faint",
} as const;

/**
 * The counts below are derived, not typed out.
 *
 * The previous version hard-coded "one complete, one underway, two ahead" into
 * the lede and the section aside. Moving a roadmap stage forward then left two
 * sentences quietly contradicting the list directly beneath them — the exact
 * kind of small, checkable inconsistency a careful reader notices and a
 * careless one does not, which is the worst possible audience split.
 */
function count(state: (typeof roadmap)[number]["state"]) {
  return roadmap.filter((s) => s.state === state).length;
}

export default function AiJourneyPage() {
  const done = count("done");
  const current = count("current");
  const next = count("next");

  const shipped = aiTrajectory.filter((m) => m.state !== "planned").length;

  return (
    <div className="shell">
      <PageHeader
        eyebrow="AI journey"
        title="AI systems are a backend problem with a harder correctness story."
        lede={
          "Models are the visible part. Serving, data pipelines, evaluation and " +
          "behaviour under load are infrastructure — and that is the foundation I am " +
          "building, from the infrastructure side rather than the model side. What " +
          "follows separates what exists from what is still intent."
        }
      />

      <Section
        title="Roadmap"
        aside={`${String(done).padStart(2, "0")} complete · ${String(current).padStart(2, "0")} in progress · ${String(next).padStart(2, "0")} planned`}
      >
        <ol className="border-b border-rule">
          {roadmap.map((stage, i) => (
            <li key={stage.phase}>
              <FadeIn delay={i * 0.07}>
                <article className="grid gap-4 border-t border-rule py-10 md:grid-cols-[minmax(9rem,14vw)_1fr] md:gap-12">
                  <div>
                    <p className="mono text-h3 tabular-nums text-fg-faint">
                      {stage.phase}
                    </p>
                    <p
                      className={cx(
                        "label mt-2",
                        stage.state === "current" && "!text-signal",
                      )}
                    >
                      {STATE_LABEL[stage.state]}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-display text-h2">{stage.title}</h3>
                    <p className="prose-measure mt-4 text-lead text-fg-muted">
                      {stage.detail}
                    </p>
                  </div>
                </article>
              </FadeIn>
            </li>
          ))}
        </ol>
      </Section>

      {/* The section that makes the rest of the page credible. A trajectory
          stated without evidence is a wish; stating which items are shipped,
          which are underway and which have not started is what separates the
          two, and it is cheaper than being caught overclaiming once. */}
      <Section
        title="Evidence"
        aside={`${shipped} underway or shipped · ${aiTrajectory.length - shipped} not started`}
      >
        <ol className="border-b border-rule">
          {aiTrajectory.map((m, i) => (
            <li key={m.title}>
              <FadeIn delay={i * 0.06}>
                <article className="grid gap-4 border-t border-rule py-8 md:grid-cols-[minmax(9rem,14vw)_1fr] md:gap-12">
                  <p className={cx("label", MILESTONE_STYLE[m.state], "!font-normal")}>
                    <span className={MILESTONE_STYLE[m.state]}>
                      {MILESTONE_LABEL[m.state]}
                    </span>
                  </p>
                  <div className="min-w-0">
                    <h3 className="font-display text-h3">
                      {m.href ? (
                        <Link
                          href={m.href}
                          className="transition-colors hover:text-signal"
                        >
                          {m.title}
                          <span aria-hidden="true" className="ml-2 text-fg-faint">
                            →
                          </span>
                        </Link>
                      ) : (
                        m.title
                      )}
                    </h3>
                    <p className="mono mt-1 text-label text-fg-muted">{m.org}</p>
                    <p className="prose-measure mt-4 text-body text-fg-muted">
                      {m.detail}
                    </p>
                  </div>
                </article>
              </FadeIn>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Why this order">
        <TextReveal
          as="h3"
          text="Because infrastructure is the part that has to be right first."
          className="font-display mb-8 text-h2 max-w-[22ch]"
        />
        <div className="prose-measure text-lead text-fg-muted">
          <p>
            A model that returns the wrong answer is a research problem. A serving layer
            that returns the right answer to the wrong tenant, or silently drops a third
            of a batch, is an engineering failure — and it is the kind of failure I have
            already spent four years learning to design against in a physical system.
          </p>
          <p>
            So the sequence is deliberate. Fundamentals first, because you cannot reason
            about cost without them. Then backend depth, because that is where correctness
            is enforced. Then concurrency and distribution, because that is where
            correctness gets hard. ML systems last, because they need all three.
          </p>
          <p>
            The honest version of where that leaves me today: I am a backend engineer with{" "}
            {mergedCount} merged contributions to Python infrastructure and open work on a
            CNCF AI-benchmarking framework. Not an ML engineer. The work above is the
            route between the two, and I would rather it be read as a route than as a
            claim.
          </p>
        </div>
        <div className="mt-9 flex flex-wrap gap-2">
          {[
            "Serving",
            "Data pipelines",
            "Evaluation",
            "Benchmarking",
            "Inference cost",
          ].map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
        <div className="mt-9 flex flex-wrap gap-3">
          <Button href="/open-source">Upstream contributions</Button>
          <Button href="/projects" variant="outline">
            See the work
          </Button>
        </div>
      </Section>
    </div>
  );
}
