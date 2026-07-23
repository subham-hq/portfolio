"use client";

import { useId, useState } from "react";
import { z } from "zod";
import { person } from "@/content/site";
import { cx } from "@/lib/utils";
import { CopyEmail } from "./CopyEmail";

/**
 * Contact form.
 *
 * The site is a static export, so there is no server to receive a POST. The
 * form submits directly to Web3Forms, which exists for exactly this case: a
 * public access key, no backend, no account plumbing on the site side.
 *
 * Validation runs here with the same Zod schema that shapes the field hints,
 * so the two cannot disagree. Client-side validation is a courtesy rather than
 * a control — anyone can POST to the endpoint directly — but the endpoint is
 * not ours to defend, and nothing sensitive passes through it.
 *
 * With no key configured the form still renders and validates, then tells the
 * visitor to email directly and offers a copy button. It never silently
 * swallows a message.
 */

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80),
  email: z.string().trim().email("Enter an email address I can reply to."),
  subject: z.string().trim().min(3, "Add a subject.").max(120),
  body: z
    .string()
    .trim()
    .min(20, "Tell me a little more — 20 characters minimum.")
    .max(4000, "That is over 4000 characters. Email me directly instead."),
});

type Field = "name" | "email" | "subject" | "body";
type Status = "idle" | "sending" | "sent" | "error";

function FieldRow({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  rows,
  placeholder,
  autoComplete,
}: {
  label: string;
  name: Field;
  value: string;
  onChange: (name: Field, value: string) => void;
  error?: string;
  type?: string;
  rows?: number;
  placeholder?: string;
  autoComplete?: string;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  // 16px minimum: iOS Safari zooms the viewport on focus for anything smaller,
  // which throws the visitor out of the layout mid-form.
  const shared = cx(
    "w-full min-h-12 border-b bg-transparent py-3 text-body text-fg outline-none transition-colors",
    "placeholder:text-fg-faint focus:border-signal",
    error ? "border-[color:var(--stop)]" : "border-rule-strong",
  );

  return (
    <div className="grid gap-2 md:grid-cols-[minmax(9rem,14vw)_1fr] md:gap-12">
      <label htmlFor={id} className="label pt-4">
        {label}
      </label>
      <div>
        {rows ? (
          <textarea
            id={id}
            name={name}
            rows={rows}
            value={value}
            onChange={(e) => onChange(name, e.target.value)}
            placeholder={placeholder}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className={cx(shared, "min-h-32 resize-y")}
          />
        ) : (
          <input
            id={id}
            name={name}
            type={type}
            value={value}
            onChange={(e) => onChange(name, e.target.value)}
            placeholder={placeholder}
            autoComplete={autoComplete}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className={shared}
          />
        )}
        {error ? (
          <p id={errorId} className="mono mt-2 text-micro text-[color:var(--stop)]">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

const EMPTY = { name: "", email: "", subject: "", body: "" };

export function ContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const update = (name: Field, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Honeypot: hidden from sight and from assistive technology. Anything in it
    // came from a bot, so report success and let it stop retrying.
    const form = event.currentTarget;
    const honeypot = (form.elements.namedItem("company") as HTMLInputElement)?.value;
    if (honeypot) {
      setStatus("sent");
      return;
    }

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Partial<Record<Field, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as Field | undefined;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      setStatus("error");
      setMessage("Check the highlighted fields.");
      return;
    }

    setStatus("sending");
    
    try {
      const response = await fetch(
        "https://contact-form.subham-bh.workers.dev",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: parsed.data.name,
            email: parsed.data.email,
            subject: parsed.data.subject,
            message: parsed.data.body,
          }),
        },
      );

      const result = await response.json();
    
      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Failed to send");
      }
    
      setStatus("sent");
    } catch {
      setStatus("error");
      setMessage(
        "The message did not send. Email me directly — the address is below and the button copies it.",
      );
    }
    };

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-8">
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <FieldRow
        label="Name"
        name="name"
        value={values.name}
        onChange={update}
        error={errors.name}
        autoComplete="name"
        placeholder="Your name"
      />
      <FieldRow
        label="Email"
        name="email"
        type="email"
        value={values.email}
        onChange={update}
        error={errors.email}
        autoComplete="email"
        placeholder="Where I should reply"
      />
      <FieldRow
        label="Subject"
        name="subject"
        value={values.subject}
        onChange={update}
        error={errors.subject}
        placeholder="Role, project, or question"
      />
      <FieldRow
        label="Message"
        name="body"
        rows={6}
        value={values.body}
        onChange={update}
        error={errors.body}
        placeholder="What you're working on and what you need."
      />

      <div className="grid gap-4 md:grid-cols-[minmax(9rem,14vw)_1fr] md:gap-12">
        <span />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={status === "sending"}
            className="mono inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-sm bg-fg px-5 py-3 text-label uppercase tracking-[0.11em] text-bg transition-opacity hover:opacity-85 disabled:opacity-50 sm:w-auto"
          >
            {status === "sending" ? "Sending" : "Send message"}
            <span aria-hidden="true">{status === "sending" ? "…" : "→"}</span>
          </button>
          <CopyEmail />
        </div>
      </div>

      {status === "error" && message ? (
        <div
          role="alert"
          className="grid gap-4 md:grid-cols-[minmax(9rem,14vw)_1fr] md:gap-12"
        >
          <span />
          <p className="mono text-label text-[color:var(--stop)]">
            {message}{" "}
            <a href={`mailto:${person.email}`} className="link-underline">
              {person.email}
            </a>
          </p>
        </div>
      ) : null}
    </form>
  );
}
