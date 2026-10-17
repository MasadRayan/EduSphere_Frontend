import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export type CourseRegisterState =
  | { kind: "available" }
  | { kind: "enrolled" }
  | { kind: "completed" }
  | { kind: "unapproved" };

const REASON_ID = "course-register-reason";

/**
 * Register control for a single course on the public course detail page. Progress
 * is a semester enrollment, so an available course deep-links into the enroll
 * picker with the course preselected; taken courses render a disabled button
 * plus a visible reason so the state is announced to screen readers.
 */
export function CourseRegisterButton({
  courseId,
  state,
}: {
  courseId: string;
  state: CourseRegisterState;
}) {
  if (state.kind === "unapproved") {
    return (
      <div className="space-y-2">
        <Button asChild>
          <Link href="/student/apply">Apply to enroll</Link>
        </Button>
        <p className="text-xs text-muted-foreground">
          Your student application must be approved before you can register for
          courses.
        </p>
      </div>
    );
  }

  if (state.kind === "available") {
    return (
      <div className="space-y-2">
        <Button asChild>
          <Link href={`/student/enroll?courseId=${courseId}`}>
            Register for this course
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground">
          Pick your section and pay with bKash on the enroll page.
        </p>
      </div>
    );
  }

  const completed = state.kind === "completed";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled type="button" aria-describedby={REASON_ID}>
          {completed ? "Completed" : "Registered"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/student/courses">View my courses</Link>
        </Button>
      </div>
      <p id={REASON_ID} className="text-xs text-muted-foreground">
        {completed
          ? "You have already completed this course."
          : "You are already registered for this course."}
      </p>
    </div>
  );
}
