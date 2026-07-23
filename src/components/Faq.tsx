"use client";

import { useId, useState } from "react";
import { faqs } from "@/content/faq";
import { cx } from "@/lib/utils";

/**
 * Native <details> would be simpler, but its open/close cannot be animated
 * consistently across browsers and it does not expose aria-expanded on a
 * button. This is the accessible pattern: a real button, aria-expanded,
 * aria-controls, and a region that is removed from the tree when closed.
 */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <ul className="border-b border-rule">
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        const panelId = `${baseId}-panel-${i}`;
        const buttonId = `${baseId}-button-${i}`;

        return (
          <li key={faq.question} className="border-t border-rule">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group grid w-full grid-cols-[1fr_1.5rem] items-start gap-3 py-5 text-left md:grid-cols-[minmax(9rem,14vw)_1fr_1.5rem] md:gap-12 md:py-6"
              >
                {/* The index column collapses below md; the number moves
                    inline above the question rather than stealing 40px of a
                    320px row. */}
                <span className="label hidden pt-1.5 tabular-nums md:block">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={cx(
                    "font-display text-h3 transition-colors",
                    isOpen ? "text-signal" : "group-hover:text-signal",
                  )}
                >
                  <span className="label mb-1 block tabular-nums md:hidden">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {faq.question}
                </span>
                <span
                  aria-hidden="true"
                  className={cx(
                    "mono mt-1.5 justify-self-end text-fg-faint transition-transform duration-400",
                    isOpen && "rotate-45",
                  )}
                >
                  +
                </span>
              </button>
            </h3>

            {isOpen ? (
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="grid gap-4 pb-7 md:grid-cols-[minmax(9rem,14vw)_1fr] md:gap-12 md:pb-8"
              >
                <span className="hidden md:block" />
                <p className="prose-measure text-lead text-fg-muted">{faq.answer}</p>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
