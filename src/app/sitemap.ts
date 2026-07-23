import type { MetadataRoute } from "next";
import { posts } from "@/content/posts";
import { projects } from "@/content/projects";
import { SITE_URL } from "@/content/site";

/** Required by `output: "export"`: metadata routes must be generated at build
 *  time rather than served on demand. */
export const dynamic = "force-static";

/**
 * Generated from the content modules rather than hand-maintained, so it cannot
 * list a page that does not exist or omit one that does.
 */
const routes = [
  { path: "", priority: 1, frequency: "weekly" as const },
  { path: "/about", priority: 0.9, frequency: "monthly" as const },
  { path: "/projects", priority: 0.9, frequency: "monthly" as const },
  { path: "/experience", priority: 0.8, frequency: "monthly" as const },
  { path: "/education", priority: 0.7, frequency: "yearly" as const },
  { path: "/certifications", priority: 0.7, frequency: "monthly" as const },
  { path: "/tech-stack", priority: 0.7, frequency: "monthly" as const },
  { path: "/ai-journey", priority: 0.7, frequency: "monthly" as const },
  { path: "/timeline", priority: 0.6, frequency: "monthly" as const },
  { path: "/open-source", priority: 0.7, frequency: "weekly" as const },
  { path: "/github", priority: 0.6, frequency: "weekly" as const },
  { path: "/resume", priority: 0.9, frequency: "monthly" as const },
  { path: "/blog", priority: 0.6, frequency: "weekly" as const },
  { path: "/writing", priority: 0.5, frequency: "weekly" as const },
  { path: "/contact", priority: 0.9, frequency: "yearly" as const },
  { path: "/privacy", priority: 0.2, frequency: "yearly" as const },
  { path: "/terms", priority: 0.2, frequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    ...routes.map((route) => ({
      url: `${SITE_URL}${route.path}`,
      lastModified: now,
      changeFrequency: route.frequency,
      priority: route.priority,
    })),
    ...projects.map((project) => ({
      url: `${SITE_URL}/projects/${project.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: project.featured ? 0.9 : 0.6,
    })),
    ...posts.map((post) => ({
      url: post.external ?? `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.published),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
