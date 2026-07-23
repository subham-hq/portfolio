/**
 * Streaming fallback. Mirrors the real page's rhythm — label, display heading,
 * body block — so the transition into content is a fade rather than a jump.
 * No spinner: a spinner communicates "waiting", a skeleton communicates "this
 * is what is arriving".
 */
export default function Loading() {
  return (
    <div className="shell py-band" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <div className="h-3 w-28 animate-pulse rounded-xs bg-rule" />
      <div className="mt-8 space-y-4">
        <div className="h-[clamp(2.6rem,5vw,5rem)] w-[min(100%,38rem)] animate-pulse rounded-sm bg-rule" />
        <div className="h-[clamp(2.6rem,5vw,5rem)] w-[min(100%,28rem)] animate-pulse rounded-sm bg-rule" />
      </div>
      <div className="mt-10 space-y-3">
        <div className="h-3 w-[min(100%,34rem)] animate-pulse rounded-xs bg-rule" />
        <div className="h-3 w-[min(100%,30rem)] animate-pulse rounded-xs bg-rule" />
      </div>
    </div>
  );
}
