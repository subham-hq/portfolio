import Link from "next/link";
import type { Project } from "@/content/projects";
import { Tag } from "./primitives";

/**
 * One definition of a project row, used by the index and /projects. The
 * `position` prop renders an "01 / 05" counter — a device borrowed from the
 * reference set that tells a reader how far through a list they are without
 * making them count.
 */
export function ProjectRow({
  project,
  position,
  total,
  maxTags = 6,
}: {
  project: Project;
  position: number;
  total: number;
  maxTags?: number;
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group grid gap-4 border-t border-rule py-9 md:grid-cols-[minmax(9rem,14vw)_1fr] md:gap-12"
    >
      <div className="label pt-1.5">
        <span className="tabular-nums">
          {String(position).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <span className="mt-1 block">
          {project.kind === "system" ? "System" : "Study"} · {project.year}
        </span>
      </div>

      <div className="min-w-0">
        <h3 className="font-display text-h2 transition-colors group-hover:text-signal">
          {project.name}
        </h3>
        <p className="prose-measure mt-3 text-fg-muted">{project.summary}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {project.stack.slice(0, maxTags).map((item) => (
            <Tag key={item}>{item}</Tag>
          ))}
        </div>
      </div>
    </Link>
  );
}
