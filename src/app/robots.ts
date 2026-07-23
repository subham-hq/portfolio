import type { MetadataRoute } from "next";
import { SITE_URL } from "@/content/site";

/** Required by `output: "export"`: metadata routes must be generated at build
 *  time rather than served on demand. */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
