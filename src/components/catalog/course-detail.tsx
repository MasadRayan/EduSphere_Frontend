import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseCodeTag } from "@/components/shared/course-code-tag";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/errors";
import { getSession } from "@/lib/auth/session";
import { isCatalogGated } from "@/lib/catalog/gate";
import { getCourse } from "@/lib/catalog/service";
import { getRegisteredCourses } from "@/lib/student/service";
import type { RegistrationStatus } from "@/types/enums";
import { CatalogGate } from "./catalog-gate";
import {
  CourseRegisterButton,
  type CourseRegisterState,
} from "./course-register-button";
import { PrerequisiteList } from "./prerequisite-list";

/**
 * Reads the signed-in student's registrations and reports how this course sits
 * against them. A failure degrades to "not registered" rather than breaking the
 * catalog page; the enroll page re-checks eligibility before anything is saved.
 */
async function getCourseRegistrationStatus(
  courseId: string,
): Promise<RegistrationStatus | null> {
  try {
    const registrations = await getRegisteredCourses();
    const match = registrations.find(
      (registration) => registration.courseSection.courseId === courseId,
    );
    return match?.status ?? null;
  } catch {
    return null;
  }
}

export async function CourseDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    return <CatalogGate nextPath={`/courses/${id}`} what="Course details" />;
  }

  let course: Awaited<ReturnType<typeof getCourse>>;
  try {
    course = await getCourse(id);
  } catch (error) {
    if (isCatalogGated(error)) {
      return <CatalogGate nextPath={`/courses/${id}`} what="Course details" />;
    }
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  let registerState: CourseRegisterState | null = null;
  if (session.role === "STUDENT") {
    if (!session.studentProfile) {
      registerState = { kind: "unapproved" };
    } else {
      const status = await getCourseRegistrationStatus(course.id);
      if (status === "COMPLETED") {
        registerState = { kind: "completed" };
      } else if (status === "ENROLLED") {
        registerState = { kind: "enrolled" };
      } else {
        registerState = { kind: "available" };
      }
    }
  }

  return (
    <article className="space-y-8">
      <header className="space-y-4">
        <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
          Course
        </p>
        <CourseCodeTag code={course.code} credits={course.creditHours} />
        <h1 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {course.title}
        </h1>
        {course.department ? (
          <p className="text-muted-foreground">{course.department.name}</p>
        ) : null}
      </header>

      {registerState ? (
        <CourseRegisterButton courseId={course.id} state={registerState} />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1 rounded-xl border border-border bg-background p-4">
          <p className="text-sm text-muted-foreground">Credit hours</p>
          <p className="font-mono text-lg font-semibold">
            {course.creditHours}
          </p>
        </div>
        {course.department ? (
          <div className="space-y-1 rounded-xl border border-border bg-background p-4">
            <p className="text-sm text-muted-foreground">Department</p>
            <p className="font-display text-lg font-semibold">
              {course.department.name}
            </p>
          </div>
        ) : null}
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Prerequisites
        </h2>
        <PrerequisiteList prerequisites={course.prerequisites ?? []} />
      </section>

      <div>
        <Button asChild variant="ghost">
          <Link href="/courses">
            <ArrowLeft className="size-4" aria-hidden="true" />
            All courses
          </Link>
        </Button>
      </div>
    </article>
  );
}
