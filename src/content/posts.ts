/**
 * Writing.
 *
 * Add an entry and it appears on /blog or /writing and in the RSS feed. Until
 * then both pages render a real empty state — one that says what will be here
 * and gives the reader somewhere to go — rather than a decorative "coming soon"
 * that wastes a click.
 *
 * Set `body` to render the post inline. Set `external` to point at a post
 * published somewhere else.
 */

export type PostKind = "post" | "note";

export interface Post {
  slug: string;
  kind: PostKind;
  title: string;
  summary: string;
  published: string;
  external?: string;
  body?: string[];
}

export const posts: Post[] = [];

export const blogPosts = posts.filter((p) => p.kind === "post");
export const notes = posts.filter((p) => p.kind === "note");
