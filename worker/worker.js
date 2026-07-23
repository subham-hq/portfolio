/**
 * Contact form relay: browser -> this Worker -> Resend.
 *
 * The Worker exists because the site is a static export and the Resend API key
 * cannot live in the bundle. That makes this the only trust boundary in the
 * system, so it validates everything itself and treats the client as hostile.
 */

const ALLOWED_ORIGINS = new Set([
  "https://subhambhattacharya.com",
  "https://www.subhambhattacharya.com",
  "http://localhost:3000",
]);

// Cloudflare Pages gives every deployment its own subdomain and the hash
// changes on every push, so preview origins are matched by suffix instead.
const ALLOWED_ORIGIN_SUFFIXES = ["portfolio-ccv.pages.dev"];

const MAX_BODY_BYTES = 16 * 1024;

const LIMITS = {
  name: [2, 80],
  email: [5, 254],
  subject: [3, 120],
  message: [20, 4000],
};

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;

  let host;
  try {
    const url = new URL(origin);
    if (url.protocol !== "https:") return false;
    host = url.hostname;
  } catch {
    return false;
  }

  // Exact host or a subdomain of it — never a bare `endsWith`, which would
  // also match evil-portfolio-ccv.pages.dev.
  return ALLOWED_ORIGIN_SUFFIXES.some(
    (suffix) => host === suffix || host.endsWith(`.${suffix}`),
  );
}

/** CORS is a browser convention, not a security control — curl ignores it.
 *  The real gate is the explicit origin check in fetch(). */
function cors(origin) {
  const headers = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (isAllowedOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

function json(body, status, origin) {
  return Response.json(body, { status, headers: cors(origin) });
}

/** Anything from a visitor that lands in an HTML email must be escaped first,
 *  or a stranger can put working links and markup in your inbox. */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function validate(payload) {
  if (payload.company) return "spam"; // honeypot, mirrored from the client

  for (const [field, [min, max]] of Object.entries(LIMITS)) {
    const value = payload[field];
    if (typeof value !== "string") return `Missing field: ${field}`;
    const trimmed = value.trim();
    if (trimmed.length < min || trimmed.length > max) {
      return `Invalid field: ${field}`;
    }
    payload[field] = trimmed;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(payload.email)) {
    return "Invalid field: email";
  }
  return null;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(origin) });
    }

    if (request.method !== "POST") {
      return json({ success: false, error: "Method not allowed" }, 405, origin);
    }

    // Server-side origin check. Without this the endpoint is an open email
    // relay: anyone can burn your Resend quota and flood your inbox.
    if (!isAllowedOrigin(origin)) {
      console.error("Rejected origin:", origin);
      return json({ success: false, error: "Forbidden" }, 403, origin);
    }

    if (!request.headers.get("Content-Type")?.includes("application/json")) {
      return json({ success: false, error: "Unsupported media type" }, 415, origin);
    }

    const declaredLength = Number(request.headers.get("Content-Length") ?? 0);
    if (declaredLength > MAX_BODY_BYTES) {
      return json({ success: false, error: "Payload too large" }, 413, origin);
    }

    let payload;
    try {
      const raw = await request.text();
      if (raw.length > MAX_BODY_BYTES) {
        return json({ success: false, error: "Payload too large" }, 413, origin);
      }
      payload = JSON.parse(raw);
    } catch {
      return json({ success: false, error: "Malformed JSON" }, 400, origin);
    }

    const problem = validate(payload);
    if (problem === "spam") {
      // Report success so the bot stops retrying, but send nothing.
      return json({ success: true }, 200, origin);
    }
    if (problem) {
      return json({ success: false, error: problem }, 400, origin);
    }

    if (!env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not bound to this Worker");
      return json({ success: false, error: "Server misconfigured" }, 500, origin);
    }

    const { name, email, subject, message } = payload;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Until subhambhattacharya.com is verified in Resend, this must stay
        // onboarding@resend.dev — and `to` must be the address the Resend
        // account itself is registered under. Nothing else will deliver.
        from: "Portfolio Contact <onboarding@resend.dev>",
        to: ["subham.bh@icloud.com"],
        reply_to: email, // snake_case on the REST API; replyTo in the Node SDK
        subject: `[Portfolio] ${subject}`,
        text: `From: ${name} <${email}>\nSubject: ${subject}\n\n${message}`,
        html: `
          <h2>New portfolio contact</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
          <hr>
          <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
        `,
      }),
    });

    if (!resendResponse.ok) {
      // Log the real reason for `wrangler tail`; return nothing useful to the
      // caller. Resend errors can echo account details.
      console.error(
        "Resend rejected the send",
        resendResponse.status,
        await resendResponse.text(),
      );
      return json({ success: false, error: "Could not send message" }, 502, origin);
    }

    return json({ success: true }, 200, origin);
  },
};
