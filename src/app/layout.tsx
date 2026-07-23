import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { AmbientField } from "@/components/AmbientField";
import { CommandPalette } from "@/components/CommandPalette";
import { Preloader } from "@/components/Preloader";
import { BackToTop, ScrollProgress, ScrollVelocity } from "@/components/effects";
import { Cursor, PageTransition } from "@/components/motion";
import { bio, links, person, SITE_URL } from "@/content/site";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${person.name} — ${person.role}`,
    template: `%s — ${person.name}`,
  },
  description: bio.metaDescription,
  applicationName: person.name,
  authors: [{ name: person.name, url: SITE_URL }],
  creator: person.name,
  keywords: [
    "Subham Bhattacharya",
    "backend engineer",
    "Python developer",
    "Flask",
    "REST API",
    "BITS Pilani",
    "AI/ML systems",
    "West Bengal",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    siteName: person.name,
    title: `${person.name} — ${person.role}`,
    description: bio.ogDescription,
    url: SITE_URL,
    locale: "en_IN",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: person.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${person.name} — ${person.role}`,
    description: bio.ogDescription,
    creator: "@subhamhq",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f5f3" },
    { media: "(prefers-color-scheme: dark)", color: "#080c0c" },
  ],
  width: "device-width",
  initialScale: 1,
  // Default is `resizes-visual`, which shrinks the visual viewport when the
  // on-screen keyboard opens and pushes fixed elements around mid-form.
  // `resizes-content` keeps the layout stable while typing.
  interactiveWidget: "resizes-content",
};

/**
 * Runs before first paint so the correct theme is applied without a flash.
 * Wrapped in try/catch because localStorage throws in some privacy modes and a
 * theme preference is not worth a blank page.
 *
 * It also sets data-motion="on", which is the gate for every reveal animation.
 * The attribute is set outside the try/catch: if storage is blocked the theme
 * falls back, but motion should still work. With JavaScript disabled entirely
 * the attribute never appears and all content renders visible rather than
 * being stuck in its hidden start state.
 */
const themeInit = `
(function(){try{var s=localStorage.getItem("theme");var m=window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.setAttribute("data-theme",s||(m?"dark":"light"));}catch(e){document.documentElement.setAttribute("data-theme","light");}document.documentElement.setAttribute("data-motion","on");})();
`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: person.name,
  url: SITE_URL,
  email: person.email,
  jobTitle: person.role,
  description: bio.short,
  address: {
    "@type": "PostalAddress",
    addressRegion: "West Bengal",
    addressCountry: "IN",
  },
  alumniOf: [
    {
      "@type": "CollegeOrUniversity",
      name: "Birla Institute of Technology and Science, Pilani",
    },
  ],
  knowsAbout: [
    "Backend engineering",
    "Python",
    "REST APIs",
    "Database design",
    "Multi-tenant architecture",
    "Machine learning systems",
  ],
  knowsLanguage: ["Bengali", "English", "Hindi"],
  sameAs: [links.github, links.linkedin, links.x, links.youtube],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={fontVariables}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="grain">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-sm focus:bg-fg focus:px-4 focus:py-2 focus:text-bg"
        >
          Skip to content
        </a>
        <AmbientField />
        <ScrollProgress />
        <ScrollVelocity />
        <CommandPalette />
        <Preloader />
        <Cursor />
        <Header />
        <main id="main">
          <PageTransition>{children}</PageTransition>
        </main>
        <BackToTop />
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
