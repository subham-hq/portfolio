import type { Metadata } from "next";
import Link from "next/link";
import { Button, PageHeader, Section } from "@/components/primitives";
import { blogPosts } from "@/content/posts";
import { links } from "@/content/site";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Long-form writing on backend engineering, systems design and the route from " +
    "operations into software.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <div className="shell">
      <PageHeader
        eyebrow="Blog"
        title="Long-form, when it earns the length."
        lede={
          "Four posts a year that hold up beat forty that restate documentation. First " +
          "in draft: enforcing multi-tenant isolation at the data layer, and why money " +
          "belongs in integers."
        }
      />

      <Section
        title="Posts"
        aside={blogPosts.length ? `${blogPosts.length}` : "None yet"}
      >
        {blogPosts.length === 0 ? (
          /* An empty screen is an invitation to act, so it points somewhere real. */
          <div className="border border-dashed border-rule-strong p-8">
            <p className="font-display text-h3">Nothing published yet</p>
            <p className="prose-measure mt-3 text-fg-muted">
              The first post is in draft. In the meantime, the case studies under Projects
              contain the same kind of reasoning — problem, approach, trade-offs, and what
              I would change.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/projects" variant="outline">
                Read a case study
              </Button>
              <Button href={links.x} variant="outline" external>
                Follow for the first one
              </Button>
            </div>
          </div>
        ) : (
          <ul className="border-b border-rule">
            {blogPosts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={post.external ?? `/blog/${post.slug}`}
                  className="group grid gap-3 border-t border-rule py-8 md:grid-cols-[minmax(9rem,14vw)_1fr] md:gap-12"
                >
                  <p className="label pt-1">{post.published}</p>
                  <div>
                    <h2 className="font-display text-h2 transition-colors group-hover:text-signal">
                      {post.title}
                    </h2>
                    <p className="prose-measure mt-3 text-fg-muted">{post.summary}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
