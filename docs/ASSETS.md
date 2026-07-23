# Images to add

The site builds and deploys without any of these. Add them when convenient;
each one is optional and each has a defined fallback.

All files go in `public/`.

| File | Size | Ratio | Format | Where it appears | Notes |
| --- | --- | --- | --- | --- | --- |
| `subham-bhattacharya-resume.pdf` | — | — | PDF | About, Contact, Résumé, footer | **Highest priority.** Four links currently 404. One page. Name the file exactly this. |
| `portrait.jpg` | 1200 × 1500 | 4:5 | JPEG, ~200 kB | About page | Plain background, natural light, waist-up, looking at camera. No suit. |
| `portrait-square.jpg` | 800 × 800 | 1:1 | JPEG | Reuse on LinkedIn / GitHub | Crop from the same shoot. |
| `favicon.ico` | 32 × 32 | 1:1 | ICO | Browser tab | Monogram `SB` in IBM Plex Mono, `#080c0c` on transparent. |
| `icon.png` | 512 × 512 | 1:1 | PNG | PWA / Android | Same mark, 15% padding. |
| `apple-icon.png` | 180 × 180 | 1:1 | PNG | iOS home screen | Same mark, opaque background — iOS ignores transparency. |
| `orderflow-*.png` | 1600 × 1000 | 8:5 | PNG | OrderFlow case study | 3–4 screenshots: login, admin catalogue, order list, client dashboard. Use realistic seed data. Never a real customer name. |

Not needed: an OpenGraph image. It is generated at request time from
`src/app/opengraph-image.tsx`, so it can never drift out of sync with the copy.

## Adding the icons

Drop `favicon.ico`, `icon.png` and `apple-icon.png` into `src/app/` (not
`public/`) and Next.js wires up the `<link>` tags automatically. No config.

## Adding screenshots to a case study

1. Put the files in `public/`.
2. Import `next/image` in `src/app/work/[slug]/page.tsx`.
3. Render below the relevant `<Section>`, with `sizes` set and real `alt` text
   describing what the screen shows — not "screenshot of OrderFlow".
