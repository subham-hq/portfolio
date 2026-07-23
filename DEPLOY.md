# Deploying

The build produces a **static export** — plain HTML, CSS, JS and images in
`out/`. There is no server, no adapter and no runtime.

---

## Cloudflare Pages

### The one thing that has been failing

Both failed builds ran this:

```
Executing user command: npx @cloudflare/next-on-pages@1
npm error code ERESOLVE
```

`@cloudflare/next-on-pages` is **deprecated**. Cloudflare's own npm page says to
stop using it, and its peer dependency range no longer resolves against current
wrangler — so it cannot install, and the build dies before it reaches any of
this project's code.

That command is stored in the **Pages project settings**, not in this
repository. Nothing committed here can override it. It gets set automatically
if you pick the **Next.js** framework preset when creating the project.

### Correct settings

Pages project → **Settings** → **Build & deployments** → **Build configuration**
→ *Edit*:

| Field | Value |
| --- | --- |
| Framework preset | **None** |
| Build command | `npm run build` |
| Build output directory | `out` |
| Root directory | *(blank)* |

**Delete whatever is in "Build command" first.** If it still reads
`npx @cloudflare/next-on-pages@1`, the next build will fail exactly as before.

Then **Settings → Variables and Secrets** → add:

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://subhambhattacharya.com` |

Save, then **Deployments → Retry deployment**. Changing build settings does not
trigger a rebuild on its own.

### If it still will not behave

Skip the Git integration entirely and upload the built folder yourself:

```bash
npm install
npm run build
npx wrangler pages deploy out --project-name=personal-website
```

This uses no build command, no framework preset and no adapter. It uploads the
finished files directly. If the dashboard build is fighting you, this always
works.

### Custom domain

Pages project → **Custom domains** → **Set up a domain** → enter
`subhambhattacharya.com`. DNS is already on Cloudflare, so the record is
created for you. Add `www` as a second domain if you want it to redirect.

---

## Vercel

Import the repository. Everything is detected automatically. Set
`NEXT_PUBLIC_SITE_URL` and deploy.

---

## Anywhere else

`npm run build` writes `out/`. Upload that folder to any static host — Netlify,
GitHub Pages, S3, nginx. `public/_headers` and `public/_redirects` are
Cloudflare-specific and are simply ignored elsewhere.

## Local preview of the real output

```bash
npm run build
npm run preview      # serves out/ at http://localhost:3000
```
