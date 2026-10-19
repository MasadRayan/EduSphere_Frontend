"use client";

import Link from "next/link";
import { CourseCodeTag } from "@/components/shared/course-code-tag";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { Course } from "@/types/entities";
import { useCourseSelection } from "./course-selection";

/**
 * A catalog card with a checkbox. The checkbox is a sibling of the title link
 * rather than nested inside it, so keyboard and screen-reader users get one
 * control per action and ticking a card never navigates.
 */
export function SelectableCourseCard({ course }: { course: Course }) {
  const { isSelected, toggle } = useCourseSelection();
  const checked = isSelected(course.id);
  const checkboxId = `catalog-course-${course.id}`;

  return (
    <Card
      className={
        checked
          ? "h-full ring-2 ring-primary/50 transition-colors"
          : "h-full transition-colors"
      }
    >
      <CardHeader>
        <div className="flex items-start gap-3">
          <Checkbox
            id={checkboxId}
            checked={checked}
            onCheckedChange={(next) =>
              toggle(
                {
                  id: course.id,
                  code: course.code,
                  title: course.title,
                  creditHours: course.creditHours,
                },
                Boolean(next),
              )
            }
            className="mt-1"
            aria-label={`Select ${course.code} ${course.title}`}
          />
          <div className="min-w-0 flex-1 space-y-2">
            <CourseCodeTag code={course.code} credits={course.creditHours} />
            <CardTitle className="font-display text-base">
              <label htmlFor={checkboxId} className="cursor-pointer">
                {course.title}
              </label>
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="mt-auto flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{course.department?.name}</span>
        <Link
          href={`/courses/${course.id}`}
          className="font-mono text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {course.creditHours} credits · Details
        </Link>
      </CardContent>
    </Card>
  );
}
