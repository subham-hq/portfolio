import { figures } from "@/content/site";
import { CountUp } from "./effects";

/** Checkable numbers only. A statistic a reviewer cannot verify invites them to
 *  discount everything around it. */
export function Figures() {
  return (
    <dl className="grid grid-cols-1 gap-px border-y border-rule bg-rule sm:grid-cols-3">
      {figures.map((figure) => (
        <div key={figure.label} className="bg-bg py-4 sm:py-7">
          <dt className="sr-only">{figure.label}</dt>
          {/* Two columns on a phone — the number beside its label rather than
              above it — so three figures cost ~150px instead of ~330px and the
              section below stays within reach of the first scroll. */}
          <dd className="m-0 flex items-baseline gap-4 sm:block">
            <span className="whitespace-nowrap">
              <span className="figure-value">
                <CountUp value={figure.value} />
              </span>
              <span className="mono ml-1.5 text-label text-signal">{figure.unit}</span>
            </span>
            <p className="max-w-[24ch] text-body text-fg-muted sm:mt-2">{figure.label}</p>
          </dd>
        </div>
      ))}
    </dl>
  );
}
