"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { projects } from "@/content/projects";
import { footerNav, links, nav, person } from "@/content/site";
import { cx } from "@/lib/utils";

/**
 * COMMAND PALETTE
 *
 * ⌘K anywhere. Jump to any page, open any project, or run an action without
 * touching the mouse.
 *
 * This is here for a specific reason. The audience for this site is engineers,
 * and engineers navigate by keyboard. A portfolio that answers ⌘K the way
 * Linear and Raycast do says something the copy cannot: that the person who
 * built it thinks about the tools people actually use. It is also the single
 * feature most likely to make someone open the site a second time.
 *
 * Accessibility is not optional for a modal that hijacks a keyboard shortcut:
 *   · role="dialog" + aria-modal, labelled by the input
 *   · the listbox uses aria-activedescendant, so the input keeps focus while
 *     the arrow keys move the selection — screen readers announce the active
 *     option without the focus ring jumping around
 *   · Escape closes and returns focus to whatever opened it
 *   · Tab is trapped inside while open
 */

type Action =
  | { kind: "route"; href: string }
  | { kind: "external"; href: string }
  | { kind: "copy"; value: string }
  | { kind: "theme" };

interface Command {
  id: string;
  label: string;
  hint: string;
  group: string;
  keywords: string;
  action: Action;
}

function buildCommands(): Command[] {
  const pages: Command[] = [
    ...nav.map((item) => ({
      id: `nav-${item.href}`,
      label: item.label,
      hint: item.href,
      group: "Pages",
      keywords: `${item.label} ${item.href}`,
      action: { kind: "route" as const, href: item.href },
    })),
    ...Object.values(footerNav)
      .flat()
      .filter((item) => !item.href.endsWith(".xml"))
      .map((item) => ({
        id: `sub-${item.href}`,
        label: item.label,
        hint: item.href,
        group: "Pages",
        keywords: `${item.label} ${item.href}`,
        action: { kind: "route" as const, href: item.href },
      })),
  ];

  // De-duplicate — several routes appear in both the header and the footer.
  const seen = new Set<string>();
  const uniquePages = pages.filter((command) => {
    if (seen.has(command.hint)) return false;
    seen.add(command.hint);
    return true;
  });

  const work: Command[] = projects.map((project) => ({
    id: `project-${project.slug}`,
    label: project.name,
    hint: project.kind === "system" ? "System" : "Study",
    group: "Projects",
    keywords: `${project.name} ${project.summary} ${project.stack.join(" ")}`,
    action: { kind: "route", href: `/projects/${project.slug}` },
  }));

  const actions: Command[] = [
    {
      id: "copy-email",
      label: "Copy email address",
      hint: person.email,
      group: "Actions",
      keywords: "copy email contact address mail",
      action: { kind: "copy", value: person.email },
    },
    {
      id: "theme",
      label: "Toggle light / dark",
      hint: "Theme",
      group: "Actions",
      keywords: "theme dark light mode appearance",
      action: { kind: "theme" },
    },
    {
      id: "resume",
      label: "Download résumé",
      hint: "PDF",
      group: "Actions",
      keywords: "resume cv download pdf",
      action: { kind: "external", href: links.resume },
    },
    {
      id: "github",
      label: "GitHub",
      hint: "subham-hq",
      group: "Elsewhere",
      keywords: "github code repositories source",
      action: { kind: "external", href: links.github },
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      hint: "in/subham-bh",
      group: "Elsewhere",
      keywords: "linkedin profile professional network",
      action: { kind: "external", href: links.linkedin },
    },
    {
      id: "x",
      label: "X",
      hint: "@subhamhq",
      group: "Elsewhere",
      keywords: "x twitter posts",
      action: { kind: "external", href: links.x },
    },
  ];

  return [...uniquePages, ...work, ...actions];
}

/** Subsequence match — "opsrc" finds "Open source". Cheap, and it behaves the
 *  way people expect from an editor's fuzzy finder. */
function matches(haystack: string, needle: string): boolean {
  if (!needle) return true;
  const target = haystack.toLowerCase();
  const query = needle.toLowerCase().replace(/\s+/g, "");
  let index = 0;
  for (const char of query) {
    index = target.indexOf(char, index);
    if (index === -1) return false;
    index += 1;
  }
  return true;
}

export function CommandPalette() {
  const router = useRouter();
  const commands = useMemo(buildCommands, []);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const opener = useRef<Element | null>(null);

  const results = useMemo(
    () => commands.filter((command) => matches(command.keywords, query)),
    [commands, query],
  );

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
    (opener.current as HTMLElement | null)?.focus?.();
  }, []);

  const run = useCallback(
    (command: Command) => {
      const { action } = command;
      switch (action.kind) {
        case "route":
          close();
          router.push(action.href);
          break;
        case "external":
          window.open(action.href, "_blank", "noopener,noreferrer");
          close();
          break;
        case "copy":
          navigator.clipboard?.writeText(action.value).then(
            () => setCopied(true),
            () => setCopied(false),
          );
          break;
        case "theme": {
          const next =
            document.documentElement.getAttribute("data-theme") === "dark"
              ? "light"
              : "dark";
          document.documentElement.setAttribute("data-theme", next);
          try {
            localStorage.setItem("theme", next);
          } catch {
            // Blocked storage. The theme still changes for this session.
          }
          break;
        }
      }
    },
    [close, router],
  );

  // Global shortcut.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        opener.current = document.activeElement;
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    setCopied(false);
    inputRef.current?.focus();

    const { body } = document;
    const previous = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (copied) {
      const id = setTimeout(() => setCopied(false), 1800);
      return () => clearTimeout(id);
    }
  }, [copied]);

  // Keep the highlighted row in view as the arrow keys move down a long list.
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const command = results[active];
      if (command) run(command);
      return;
    }
    if (event.key === "Tab") {
      // The palette is the whole interaction while it is open.
      event.preventDefault();
    }
  };

  if (!open) return null;

  let lastGroup = "";

  return (
    <div
      className="no-print fixed inset-0 z-[95] flex items-start justify-center px-4 pt-[12vh]"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-bg-sunken/70 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative w-full max-w-xl overflow-hidden rounded-md border border-rule-strong bg-bg shadow-[var(--shadow-lift)]"
      >
        <div className="flex items-center gap-3 border-b border-rule px-4">
          <span aria-hidden="true" className="mono text-label text-signal">
            &gt;
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Jump to a page, project or action…"
            aria-label="Search pages, projects and actions"
            aria-controls="command-list"
            aria-activedescendant={
              results[active] ? `command-${results[active].id}` : undefined
            }
            role="combobox"
            aria-expanded="true"
            autoComplete="off"
            spellCheck={false}
            className="min-h-12 w-full bg-transparent text-body text-fg outline-none placeholder:text-fg-faint"
          />
          <kbd className="mono hidden shrink-0 rounded-xs border border-rule px-1.5 py-0.5 text-micro text-fg-faint sm:block">
            ESC
          </kbd>
        </div>

        <ul
          ref={listRef}
          id="command-list"
          role="listbox"
          aria-label="Results"
          className="max-h-[54vh] overflow-y-auto overscroll-contain py-2"
        >
          {results.length === 0 ? (
            <li className="px-4 py-6 text-body text-fg-muted">
              Nothing matches “{query}”. Try a page name, a project, or “email”.
            </li>
          ) : (
            results.map((command, index) => {
              const showGroup = command.group !== lastGroup;
              lastGroup = command.group;
              const isActive = index === active;

              return (
                <li key={command.id}>
                  {showGroup ? (
                    <p className="label px-4 pt-3 pb-1.5">{command.group}</p>
                  ) : null}
                  <div
                    id={`command-${command.id}`}
                    role="option"
                    aria-selected={isActive}
                    data-index={index}
                    onPointerEnter={() => setActive(index)}
                    onPointerDown={(event) => {
                      event.preventDefault();
                      run(command);
                    }}
                    className={cx(
                      "mx-2 flex cursor-pointer items-center justify-between gap-4 rounded-sm px-2.5 py-2.5 transition-colors",
                      isActive ? "bg-bg-sunken text-fg" : "text-fg-muted",
                    )}
                  >
                    <span className="truncate text-body">
                      {command.id === "copy-email" && copied
                        ? "Copied to clipboard"
                        : command.label}
                    </span>
                    <span className="mono shrink-0 text-micro text-fg-faint">
                      {command.hint}
                    </span>
                  </div>
                </li>
              );
            })
          )}
        </ul>

        <div className="flex items-center gap-4 border-t border-rule px-4 py-2.5">
          {[
            ["↑↓", "navigate"],
            ["↵", "select"],
            ["esc", "close"],
          ].map(([key, meaning]) => (
            <span key={key} className="label flex items-center gap-1.5">
              <kbd className="mono rounded-xs border border-rule px-1 text-micro">
                {key}
              </kbd>
              {meaning}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** The affordance. A shortcut nobody knows about is a shortcut nobody uses. */
export function CommandHint() {
  const [mac, setMac] = useState(true);

  useEffect(() => {
    setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }),
        );
      }}
      aria-label="Open command palette"
      className="tap mono hidden items-center justify-center gap-1.5 rounded-xs border border-rule px-2 text-micro text-fg-faint transition-colors hover:border-signal hover:text-signal lg:inline-flex"
    >
      <span aria-hidden="true">{mac ? "⌘" : "Ctrl"}</span>K
    </button>
  );
}
