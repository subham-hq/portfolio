"use client";

import { useEffect } from "react";
import { Button } from "@/components/primitives";
import { links, person } from "@/content/site";

/**
 * Route-level error boundary.
 *
 * An error screen states what happened, gives a way forward, and does not
 * apologise or make a joke. The digest is surfaced because it is the only
 * thing that makes a report actionable.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Kept so the failure is visible in the browser console and in Vercel logs
    // rather than disappearing silently.
    console.error(error);
  }, [error]);

  return (
    <div className="shell flex min-h-screen-safe flex-col justify-center py-band">
      <p className="label !text-[color:var(--stop)]">Error</p>
      <h1 className="font-display mt-6 text-h1 max-w-[16ch]">
        Something on this page failed to render.
      </h1>
      <p className="prose-measure mt-8 text-lead text-fg-muted">
        The rest of the site is unaffected. Try again — if it keeps happening I would
        genuinely like to know, because that is the sort of thing this portfolio claims to
        care about.
      </p>

      {error.digest ? (
        <p className="mono mt-6 text-label text-fg-faint">
          Reference: <span className="text-fg">{error.digest}</span>
        </p>
      ) : null}

      <div className="mt-9 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="mono inline-flex items-center gap-2 rounded-sm bg-fg px-4 py-2.5 text-label uppercase tracking-[0.11em] text-bg transition-opacity hover:opacity-85"
        >
          Try again <span aria-hidden="true">↻</span>
        </button>
        <Button href="/" variant="outline">
          Back to index
        </Button>
        <Button href={links.email} variant="outline" external>
          Report it
        </Button>
      </div>

      <p className="label mt-8">{person.email}</p>
    </div>
  );
}
