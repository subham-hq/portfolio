import { Button } from "@/components/primitives";

export default function NotFound() {
  return (
    <div className="shell flex min-h-screen-safe flex-col justify-center py-band">
      <p className="label">Error 404</p>
      <h1 className="font-display mt-6 text-h1 max-w-[14ch]">
        No route matches that path.
      </h1>
      {/* An error explains what happened and what to do next. It does not
          apologise and it does not make a joke. */}
      <p className="prose-measure mt-8 text-lead text-fg-muted">
        The page either moved or never existed. The index has everything, and the work
        section has the projects.
      </p>
      <div className="mt-9 flex flex-wrap gap-3">
        <Button href="/">Back to index</Button>
        <Button href="/projects" variant="outline">
          See the work
        </Button>
      </div>
    </div>
  );
}
