"use client";

import { AlertCircle } from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import { FormError } from "@/components/auth/form-error";
import { CourseCodeTag } from "@/components/shared/course-code-tag";
import { EmptyState } from "@/components/shared/empty-state";
import { SubmitButton } from "@/components/shared/submit-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  CREDIT_FEE_RATE,
  MAX_ENROLLMENT_COURSES,
  MAX_SEMESTER_CREDITS,
} from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import { enrollAction } from "@/lib/student/actions";
import type { Course, CourseSection, Semester } from "@/types/entities";

export interface CoursePickerProps {
  semester: Semester;
  courses: Course[];
  sections: CourseSection[];
  completedCourseIds: string[];
  enrolledCourseIds: string[];
  /** Course ids to preselect, for example when arriving from a course page. */
  initialCourseIds?: string[];
}

function deadlineOf(semester: Semester): Date {
  return new Date(semester.registrationDeadline ?? semester.startDate);
}

export function CoursePicker({
  semester,
  courses,
  sections,
  completedCourseIds,
  enrolledCourseIds,
  initialCourseIds = [],
}: CoursePickerProps) {
  const [state, formAction] = useActionState(enrollAction, undefined);
  const [blockHint, setBlockHint] = useState<string | null>(null);

  const completed = useMemo(
    () => new Set(completedCourseIds),
    [completedCourseIds],
  );
  const enrolled = useMemo(
    () => new Set(enrolledCourseIds),
    [enrolledCourseIds],
  );

  const sectionsByCourse = useMemo(() => {
    const map = new Map<string, CourseSection[]>();
    for (const section of sections) {
      const list = map.get(section.courseId) ?? [];
      list.push(section);
      map.set(section.courseId, list);
    }
    return map;
  }, [sections]);

  const deadline = deadlineOf(semester);
  const deadlinePassed = deadline.getTime() <= Date.now();

  const rows = useMemo(() => {
    return courses
      .filter((course) => !completed.has(course.id) && !enrolled.has(course.id))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [courses, completed, enrolled]);

  // Preselect requested courses only when they are actually selectable, so a
  // stale link can never submit a course with no section, missing prerequisites
  // or a passed deadline. The catalog can send many ids at once, so stop as
  // soon as the course or credit limit is reached.
  const initialSelection = useMemo(() => {
    if (deadlinePassed || initialCourseIds.length === 0) {
      return new Set<string>();
    }
    const selection = new Set<string>();
    let credits = 0;
    for (const courseId of initialCourseIds) {
      if (selection.size >= MAX_ENROLLMENT_COURSES) {
        break;
      }
      const course = rows.find((row) => row.id === courseId);
      if (!course) {
        continue;
      }
      if ((sectionsByCourse.get(courseId) ?? []).length === 0) {
        continue;
      }
      const missingPrerequisite = (course.prerequisites ?? []).some(
        (item) =>
          item.prerequisite && !completed.has(item.prerequisite.id ?? ""),
      );
      if (missingPrerequisite) {
        continue;
      }
      if (credits + course.creditHours > MAX_SEMESTER_CREDITS) {
        continue;
      }
      selection.add(courseId);
      credits += course.creditHours;
    }
    return selection;
  }, [deadlinePassed, initialCourseIds, rows, sectionsByCourse, completed]);

  const [selected, setSelected] = useState<Set<string>>(initialSelection);

  const runningCredits = useMemo(
    () =>
      courses.reduce(
        (sum, course) =>
          sum + (selected.has(course.id) ? course.creditHours : 0),
        0,
      ),
    [courses, selected],
  );
  const feeEstimate = runningCredits * CREDIT_FEE_RATE;
  const creditsLeft = MAX_SEMESTER_CREDITS - runningCredits;

  const toggle = (course: Course, checked: boolean) => {
    setBlockHint(null);
    if (!checked) {
      const next = new Set(selected);
      next.delete(course.id);
      setSelected(next);
      return;
    }
    if (selected.size >= MAX_ENROLLMENT_COURSES) {
      setBlockHint(
        `You can pick at most ${MAX_ENROLLMENT_COURSES} courses per semester.`,
      );
      return;
    }
    if (runningCredits + course.creditHours > MAX_SEMESTER_CREDITS) {
      setBlockHint(
        `This course would take you past the ${MAX_SEMESTER_CREDITS} credit limit for the semester.`,
      );
      return;
    }
    setSelected(new Set(selected).add(course.id));
  };

  return (
    <form action={formAction}>
      <FormError message={state && !state.ok ? state.message : undefined} />
      {[...selected].map((courseId) => (
        <input key={courseId} type="hidden" name="courseIds" value={courseId} />
      ))}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Pick the courses you want to take. The registrar assigns the open
            section for each course.
          </p>

          {deadlinePassed ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Registration is closed</AlertTitle>
              <AlertDescription>
                Enrollment closed on {formatDate(deadline)}. You can still view
                your enrollments and payments.
              </AlertDescription>
            </Alert>
          ) : null}

          {blockHint ? (
            <Alert>
              <AlertCircle className="size-4" />
              <AlertDescription>{blockHint}</AlertDescription>
            </Alert>
          ) : null}

          {rows.length === 0 ? (
            <EmptyState
              title="No courses to enroll in"
              description="There are no courses open for this semester yet, or you are already enrolled in every course offered."
            />
          ) : (
            rows.map((course) => (
              <CourseRow
                key={course.id}
                course={course}
                sections={sectionsByCourse.get(course.id) ?? []}
                missingPrereqs={course.prerequisites
                  ?.map((item) => item.prerequisite)
                  .filter(
                    (prereq): prereq is NonNullable<typeof prereq> =>
                      prereq !== undefined && !completed.has(prereq.id ?? ""),
                  )
                  .map((prereq) => prereq.code || prereq.title)}
                checked={selected.has(course.id)}
                disabled={deadlinePassed}
                onCheckedChange={(checked) => toggle(course, checked)}
              />
            ))
          )}
        </div>

        <div className="h-fit space-y-4 lg:sticky lg:top-24">
          <div className="space-y-3 rounded-lg border bg-card p-4">
            <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
              Your selection
            </p>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Credits</span>
                <span className="font-medium">
                  {runningCredits} of {MAX_SEMESTER_CREDITS}
                </span>
              </div>
              <Progress
                value={Math.min(
                  100,
                  (runningCredits / MAX_SEMESTER_CREDITS) * 100,
                )}
              />
              {creditsLeft < 0 ? (
                <p className="text-sm text-destructive">
                  {Math.abs(creditsLeft)} credit(s) over the limit.
                </p>
              ) : creditsLeft < 6 ? (
                <p className="text-sm text-amber-600 dark:text-amber-500">
                  {creditsLeft} credit(s) left in this semester.
                </p>
              ) : null}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Courses</span>
              <span className="font-medium">
                {selected.size} of {MAX_ENROLLMENT_COURSES}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Estimated fee</span>
              <span className="font-medium">{formatCurrency(feeEstimate)}</span>
            </div>
            <div className="flex flex-col gap-3 pt-1">
              <SubmitButton
                disabled={
                  selected.size === 0 || deadlinePassed || creditsLeft < 0
                }
                pendingLabel="Starting enrollment..."
                className="w-full"
              >
                Enroll and pay
              </SubmitButton>
              <p className="text-xs text-muted-foreground">
                You will be redirected to bKash to complete the payment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

interface CourseRowProps {
  course: Course;
  sections: CourseSection[];
  missingPrereqs?: string[];
  checked: boolean;
  disabled: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function CourseRow({
  course,
  sections,
  missingPrereqs = [],
  checked,
  disabled,
  onCheckedChange,
}: CourseRowProps) {
  const notOffered = sections.length === 0;
  const unavailable = disabled || notOffered || missingPrereqs.length > 0;
  const reason = notOffered
    ? "No section is offered for this course this semester."
    : missingPrereqs.length > 0
      ? `Missing prerequisites: ${missingPrereqs.join(", ")}`
      : null;

  return (
    <div
      className={
        unavailable
          ? "rounded-lg border bg-muted/40 p-4"
          : "rounded-lg border bg-card p-4"
      }
    >
      <div className="flex items-start gap-4">
        <Checkbox
          id={`course-${course.id}`}
          checked={checked}
          onCheckedChange={(next) => onCheckedChange(Boolean(next))}
          disabled={unavailable}
          className="mt-5"
          aria-label={`Select ${course.title}`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <CourseCodeTag code={course.code} credits={course.creditHours} />
            <div className="min-w-0">
              <label
                htmlFor={`course-${course.id}`}
                className={`cursor-pointer font-medium ${
                  unavailable ? "text-muted-foreground" : ""
                }`}
              >
                {course.title}
              </label>
              <p className="text-sm text-muted-foreground">
                {course.creditHours} credit(s)
              </p>
            </div>
            {reason ? (
              <Badge
                variant={notOffered ? "secondary" : "destructive"}
                className="max-w-full"
              >
                {reason}
              </Badge>
            ) : null}
          </div>

          {sections.length > 0 ? (
            <ul className="mt-3 space-y-1.5">
              {sections.map((section) => (
                <li
                  key={section.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground"
                >
                  <span className="font-mono text-xs font-medium text-foreground">
                    {section.sectionCode}
                  </span>
                  <span>{section.instructor?.user.name ?? "TBA"}</span>
                  {section.schedule ? <span>{section.schedule}</span> : null}
                  <span>{section.capacity} seats</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
