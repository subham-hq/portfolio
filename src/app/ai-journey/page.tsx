import type { Metadata } from "next";
import { FadeIn, TextReveal } from "@/components/motion";
import { Button, PageHeader, Section } from "@/components/primitives";
import { roadmap } from "@/content/records";
import { cx } from "@/lib/utils";

export const metadata: Metadata = {
  title: "AI journey",
  description:
    "The route from C and fundamentals through backend engineering to AI/ML systems — " +
    "stated as intent, with the evidence for each stage.",
  alternates: { canonical: "/ai-journey" },
};

const STATE_LABEL = {
  done: "Complete",
  current: "In progress",
  next: "Planned",
} as const;

export default function AiJourneyPage() {
  return (
    <div className="shell">
      <PageHeader
        eyebrow="AI journey"
        title="AI systems are a backend problem with a harder correctness story."
        lede={
          "Models are the visible part. Serving, data pipelines, evaluation and " +
          "behaviour under load are infrastructure — and that is the foundation I am " +
          "building. One stage complete, one underway, two ahead."
        }
      />

      <Section title="Roadmap" aside="01 complete · 01 in progress · 02 planned">
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
        </div>
        <div className="mt-9 flex flex-wrap gap-3">
          <Button href="/projects">See the evidence</Button>
          <Button href="/experience" variant="outline">
            Full timeline
          </Button>
        </div>
      </Section>
    </div>
  );
}
