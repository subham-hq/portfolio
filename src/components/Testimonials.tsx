import { Button } from "./primitives";

/**
 * Deliberately empty, and saying so.
 *
 * The alternative — inventing quotes, or padding with a vague line from someone
 * who has never seen the code — is the single fastest way to lose a reviewer's
 * trust in everything else on the page. An honest empty state costs nothing and
 * signals that every other claim here is real.
 *
 * Replace `references` with real entries once you have them. Ask a CS50
 * grader, a course TA, or anyone who has reviewed your code — a specific,
 * verifiable sentence from a named person beats five anonymous superlatives.
 */

interface Reference {
  quote: string;
  name: string;
  role: string;
  url?: string;
}

const references: Reference[] = [];

export function Testimonials() {
  if (references.length === 0) {
    return (
      <div className="border border-dashed border-rule-strong p-8">
        <p className="font-display text-h3">References on request</p>
        <p className="prose-measure mt-3 text-fg-muted">
          The people who can speak to my engineering are the ones who have read the code.
          Ask and I will put you in touch — or start with the repositories and judge the
          work directly.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/projects" variant="outline">
            Read the code
          </Button>
          <Button href="/contact" variant="outline">
            Ask for a reference
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ul className="grid gap-px bg-rule md:grid-cols-2">
      {references.map((reference) => (
        <li key={reference.name} className="bg-bg p-7">
          <blockquote className="prose-measure text-lead">{reference.quote}</blockquote>
          <p className="mono mt-5 text-label">
            {reference.name}
            <span className="text-fg-faint"> · {reference.role}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
