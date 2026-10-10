import Link from "next/link";
import { CourseCodeTag } from "@/components/shared/course-code-tag";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Course } from "@/types/entities";

export function CourseCard({ course }: { course: Course }) {
  const prerequisiteCount = course.prerequisites?.length ?? 0;

  return (
    <Link
      href={`/courses/${course.id}`}
      className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="h-full transition-colors group-hover:ring-primary/40">
        <CardHeader>
          <CourseCodeTag code={course.code} credits={course.creditHours} />
          <CardTitle className="font-display text-base">
            {course.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-auto flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {course.department?.name}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {prerequisiteCount > 0
              ? `${prerequisiteCount} prerequisite${prerequisiteCount === 1 ? "" : "s"}`
              : "No prerequisites"}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
