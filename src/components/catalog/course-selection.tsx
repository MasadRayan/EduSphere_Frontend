"use client";

import { AlertCircle, ArrowRight, X } from "lucide-react";
import Link from "next/link";
import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  CREDIT_FEE_RATE,
  MAX_ENROLLMENT_COURSES,
  MAX_SEMESTER_CREDITS,
} from "@/lib/constants";
import { formatCurrency } from "@/lib/format";

export interface SelectableCourse {
  id: string;
  code: string;
  title: string;
  creditHours: number;
}

interface CourseSelectionValue {
  enabled: boolean;
  selected: SelectableCourse[];
  isSelected: (courseId: string) => boolean;
  toggle: (course: SelectableCourse, checked: boolean) => void;
  clear: () => void;
  hint: string | null;
  totalCredits: number;
  totalFee: number;
}

const CourseSelectionContext = createContext<CourseSelectionValue | null>(null);

/**
 * Holds the catalog selection across pagination, department changes and
 * searches. It lives above the keyed Suspense boundary in CoursesSection so
 * navigating to another page never clears what the student already ticked.
 *
 * Limits mirror the enroll picker. The backend still owns the real rules; this
 * only stops obvious mistakes before the student reaches the payment step.
 */
export function CourseSelectionProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  const [selected, setSelected] = useState<Map<string, SelectableCourse>>(
    () => new Map(),
  );
  const [hint, setHint] = useState<string | null>(null);

  const totalCredits = useMemo(
    () =>
      [...selected.values()].reduce(
        (sum, course) => sum + course.creditHours,
        0,
      ),
    [selected],
  );
  const totalFee = totalCredits * CREDIT_FEE_RATE;

  const toggle = (course: SelectableCourse, checked: boolean) => {
    setHint(null);

    if (!checked) {
      setSelected((current) => {
        const next = new Map(current);
        next.delete(course.id);
        return next;
      });
      return;
    }

    if (selected.has(course.id)) {
      return;
    }
    if (selected.size >= MAX_ENROLLMENT_COURSES) {
      setHint(
        `You can pick at most ${MAX_ENROLLMENT_COURSES} courses per semester.`,
      );
      return;
    }
    if (totalCredits + course.creditHours > MAX_SEMESTER_CREDITS) {
      setHint(
        `This course would take you past the ${MAX_SEMESTER_CREDITS} credit limit for the semester.`,
      );
      return;
    }

    setSelected((current) => new Map(current).set(course.id, course));
  };

  const clear = () => {
    setHint(null);
    setSelected(new Map());
  };

  const value: CourseSelectionValue = {
    enabled,
    selected: [...selected.values()],
    isSelected: (courseId) => selected.has(courseId),
    toggle,
    clear,
    hint,
    totalCredits,
    totalFee,
  };

  return (
    <CourseSelectionContext.Provider value={value}>
      {children}
    </CourseSelectionContext.Provider>
  );
}

export function useCourseSelection(): CourseSelectionValue {
  const value = useContext(CourseSelectionContext);
  if (!value) {
    throw new Error(
      "useCourseSelection must be used inside CourseSelectionProvider",
    );
  }
  return value;
}

export function CourseSelectionBar() {
  const { enabled, selected, clear, hint, totalCredits, totalFee, toggle } =
    useCourseSelection();

  if (!enabled) {
    return null;
  }

  const registerHref = `/student/enroll?${selected
    .map((course) => `courseId=${encodeURIComponent(course.id)}`)
    .join("&")}`;

  return (
    <div className="sticky bottom-4 z-30 space-y-2">
      {hint ? (
        <Alert>
          <AlertCircle className="size-4" />
          <AlertDescription>{hint}</AlertDescription>
        </Alert>
      ) : null}

      {selected.length > 0 ? (
        <div
          aria-live="polite"
          className="rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/85"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
                  Your selection
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {selected.length}
                  </span>{" "}
                  of {MAX_ENROLLMENT_COURSES} courses
                  <span aria-hidden="true"> · </span>
                  <span className="font-medium text-foreground">
                    {totalCredits}
                  </span>{" "}
                  of {MAX_SEMESTER_CREDITS} credits
                  <span aria-hidden="true"> · </span>
                  {formatCurrency(totalFee)} estimated
                </p>
              </div>
              <ul className="flex flex-wrap gap-2">
                {selected.map((course) => (
                  <li key={course.id}>
                    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background py-0.5 pr-1 pl-2 font-mono text-xs font-medium">
                      {course.code}
                      <button
                        type="button"
                        onClick={() => toggle(course, false)}
                        className="rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        aria-label={`Remove ${course.code} from selection`}
                      >
                        <X className="size-3" aria-hidden="true" />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Button type="button" variant="ghost" onClick={clear}>
                Clear
              </Button>
              <Button asChild>
                <Link href={registerHref}>
                  Register selected
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
