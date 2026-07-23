"use client";

/**
 * Replaces the root layout when the layout itself throws, so it cannot rely on
 * the design system, fonts or any provider being available. Styles are inline
 * for that reason — this is the one file in the project where that is correct.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "2rem",
          background: "#f4f5f3",
          color: "#0e1414",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <p
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: "0.75rem",
            letterSpacing: "0.11em",
            textTransform: "uppercase",
            color: "#a83c29",
            margin: 0,
          }}
        >
          Application error
        </p>
        <h1
          style={{
            fontSize: "clamp(2rem, 6vw, 3.5rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            margin: "1.5rem 0 0",
            maxWidth: "18ch",
          }}
        >
          The site failed to load.
        </h1>
        <p style={{ maxWidth: "52ch", color: "#4b5250", marginTop: "1.5rem" }}>
          Reloading usually fixes it. If it does not, email subham.bh@icloud.com
          {error.digest ? ` and quote reference ${error.digest}.` : "."}
        </p>
        <div style={{ marginTop: "2rem", display: "flex", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={reset}
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: "0.75rem",
              letterSpacing: "0.11em",
              textTransform: "uppercase",
              background: "#0e1414",
              color: "#f4f5f3",
              border: 0,
              borderRadius: "4px",
              padding: "0.7rem 1.1rem",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
