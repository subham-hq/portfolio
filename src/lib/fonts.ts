import { Archivo, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";

/**
 * Three families, three jobs. Self-hosted by next/font at build time, so there
 * is no render-blocking request to a font CDN and no layout shift.
 *
 * This is the one build-time network dependency in the project: next/font
 * fetches these from Google Fonts during compilation. If that host is
 * unreachable the build fails loudly rather than degrading, which is the
 * correct behaviour — a silently fallback-rendered site is worse than a build
 * you can retry.
 */

/** Display only. Used at 400–700 with tight negative tracking. */
export const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
  weight: ["400", "500", "600", "700"],
});

/** Body and UI. */
export const instrument = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument",
});

/** Every label, key, number and code fragment. Tabular figures by default. */
export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
});

export const fontVariables = `${archivo.variable} ${instrument.variable} ${plexMono.variable}`;
