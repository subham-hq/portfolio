"use client";

import { useEffect, useState } from "react";
import { person } from "@/content/site";

/**
 * Solves the case that a mailto: link does not: a visitor on webmail, or on a
 * phone with no mail client bound, who would otherwise hit a dead link and
 * leave. One tap puts the address on their clipboard.
 */
export function CopyEmail() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2200);
    return () => clearTimeout(id);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(person.email);
      setCopied(true);
    } catch {
      // Clipboard blocked (insecure context or denied permission). The address
      // is visible next to this button, so there is still a path.
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="mono inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-sm border border-rule-strong px-4 py-2.5 text-label uppercase tracking-[0.11em] text-fg-muted transition-colors hover:border-signal hover:text-signal sm:w-auto"
    >
      {copied ? "Copied" : "Copy email"}
      <span aria-live="polite" className="sr-only">
        {copied ? `${person.email} copied to clipboard` : ""}
      </span>
    </button>
  );
}
