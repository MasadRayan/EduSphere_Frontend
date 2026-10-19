import Link from "next/link";
import { CourseCodeTag } from "@/components/shared/course-code-tag";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Course } from "@/types/entities";
import { SelectableCourseCard } from "./selectable-course-card";

export type CourseCardStatus = "enrolled" | "completed" | "not-offered";

const STATUS_LABELS: Record<CourseCardStatus, string> = {
  enrolled: "Registered",
  completed: "Completed",
  "not-offered": "Not offered",
};

/**
 * One catalog card with two personalities: an approved student gets a
 * checkbox (SelectableCourseCard), everyone else gets a plain link. Courses the
 * student already holds, or that have no section this semester, stay
 * browse-only with a status badge.
 */
export function CourseCard({
  course,
  selectable,
  status,
}: {
  course: Course;
  selectable: boolean;
  status?: CourseCardStatus;
}) {
  if (selectable && !status) {
    return <SelectableCourseCard course={course} />;
  }

  return (
    <Link
      href={`/courses/${course.id}`}
      className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="h-full transition-colors group-hover:ring-primary/40">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CourseCodeTag code={course.code} credits={course.creditHours} />
            {status ? (
              <Badge variant="outline">{STATUS_LABELS[status]}</Badge>
            ) : null}
          </div>
          <CardTitle className="font-display text-base">
            {course.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-auto flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {course.department?.name}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {course.creditHours} credits
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
