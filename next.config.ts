import type { NextConfig } from "next";

/**
 * Static export.
 *
 * The whole site prerenders to plain HTML, CSS, JS and images. That is a
 * deliberate deployment decision, not a limitation:
 *
 *   · Cloudflare Pages serves static assets natively. No adapter, no build
 *     plugin, no peer-dependency tree to resolve. `@cloudflare/next-on-pages`
 *     is deprecated and its peer range no longer resolves against current
 *     wrangler, which is exactly the class of failure this avoids.
 *   · The same output deploys unchanged to Vercel, Netlify, GitHub Pages or
 *     any bucket behind a CDN. Nothing here is host-specific.
 *   · Every route is a file on a CDN edge, so there is no cold start and no
 *     server to keep patched.
 *
 * What this costs, stated plainly: no ISR, no Server Actions, no on-demand
 * image optimisation. Each is handled below or in the component that needed
 * it. GitHub data is fetched at build time rather than hourly — rebuild to
 * refresh it, or wire a scheduled deploy hook.
 *
 * Headers and redirects cannot be expressed here in export mode; they live in
 * public/_headers and public/_redirects, which Cloudflare Pages reads directly.
 */
const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  poweredByHeader: false,

  // Emit /about/index.html rather than /about.html, so any static host
  // resolves clean URLs without rewrite rules.
  trailingSlash: false,

  images: {
    // No server means no optimisation endpoint. Source images are already
    // sized and compressed for their largest rendered dimension.
    unoptimized: true,
  },
};

export default nextConfig;
