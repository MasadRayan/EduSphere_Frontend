import Link from "next/link";
import { CourseCodeTag } from "@/components/shared/course-code-tag";
import type { CoursePrerequisite } from "@/types/entities";

export function PrerequisiteList({
  prerequisites,
}: {
  prerequisites: CoursePrerequisite[];
}) {
  if (prerequisites.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This course has no prerequisites.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {prerequisites.map((item) => (
        <li key={item.id}>
          <Link
            href={`/courses/${item.prerequisiteId}`}
            className="flex items-center gap-4 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <CourseCodeTag
              code={item.prerequisite?.code ?? "TBA"}
              credits={null}
            />
            <span className="text-sm font-medium">
              {item.prerequisite?.title ?? "Course details"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
