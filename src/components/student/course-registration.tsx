import "server-only";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { CoursePicker } from "@/components/student/course-picker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import {
  getActiveSemester,
  getMyEnrollments,
  getRegisteredCourses,
  listEnrollCourses,
  listOfferedSections,
} from "@/lib/student/service";
import type { Semester } from "@/types/entities";
import type { EnrollmentStatus } from "@/types/enums";

export type CourseRegistrationVariant = "page" | "dashboard";

function deadlineOf(semester: Semester): Date {
  return new Date(semester.registrationDeadline ?? semester.startDate);
}

/**
 * The multi-course registration flow. Shared by /student/enroll and the
 * student dashboard so both surfaces pick from the same list, enforce the same
 * credit and course limits, and start the same bKash enrollment.
 *
 * `page` owns the full page heading; `dashboard` renders a compact section and
 * stays out of the way when there is nothing to register (no active semester
 * or an enrollment already in progress).
 */
export async function CourseRegistrationSection({
  initialCourseIds = [],
  variant = "page",
}: {
  initialCourseIds?: string[];
  variant?: CourseRegistrationVariant;
}) {
  const semester = await getActiveSemester();

  if (!semester) {
    if (variant === "dashboard") {
      return null;
    }
    return (
      <div className="space-y-6">
        <RegistrationHeading
          variant={variant}
          description="Register for the courses you want to take this semester."
        />
        <EmptyState
          title="No active semester"
          description="There is no active enrollment period right now. Check back once the registrar opens a new semester."
        />
      </div>
    );
  }

  const [courses, registrations, enrollments] = await Promise.all([
    listEnrollCourses(),
    getRegisteredCourses(),
    getMyEnrollments({ semesterId: semester.id, limit: 10 }),
  ]);

  const activeEnrollment = enrollments.data.find((enrollment) =>
    ["PENDING", "ENROLLED"].includes(enrollment.status as string),
  );

  if (activeEnrollment) {
    if (variant === "dashboard") {
      return null;
    }
    return (
      <div className="space-y-6">
        <RegistrationHeading
          variant={variant}
          description={`Build your schedule for ${semester.name}.`}
        />
        <AlreadyEnrolledCard enrollment={activeEnrollment} />
      </div>
    );
  }

  const sections = await listOfferedSections(semester.id);

  const completedCourseIds = registrations
    .filter((registration) => registration.status === "COMPLETED")
    .map((registration) => registration.courseSection.courseId);
  const enrolledCourseIds = registrations
    .filter(
      (registration) =>
        registration.status === "ENROLLED" &&
        registration.courseSection.semesterId === semester.id,
    )
    .map((registration) => registration.courseSection.courseId);

  return (
    <div className="space-y-6">
      <RegistrationHeading
        variant={variant}
        description={
          variant === "dashboard"
            ? `Pick every course you want for ${semester.name} and pay once. Registration closes on ${formatDate(deadlineOf(semester))}.`
            : `Build your schedule for ${semester.name}. Select as many courses as you need; the registrar assigns your section on enrollment.`
        }
      />
      <CoursePicker
        semester={semester}
        courses={courses}
        sections={sections}
        completedCourseIds={completedCourseIds}
        enrolledCourseIds={enrolledCourseIds}
        initialCourseIds={initialCourseIds}
      />
    </div>
  );
}

function RegistrationHeading({
  variant,
  description,
}: {
  variant: CourseRegistrationVariant;
  description: string;
}) {
  if (variant === "dashboard") {
    return (
      <div className="space-y-1">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Course registration
        </h2>
        <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
    );
  }

  return <PageHeader title="Enroll in courses" description={description} />;
}

function AlreadyEnrolledCard({
  enrollment,
}: {
  enrollment: { id: string; status: EnrollmentStatus };
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>You are already enrolled</CardTitle>
        <CardDescription>
          You have an active enrollment for this semester.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTitle>Enrollment status</AlertTitle>
          <AlertDescription>
            Your enrollment is currently{" "}
            <StatusBadge status={enrollment.status} />. You cannot start a new
            enrollment while one is in progress.
          </AlertDescription>
        </Alert>
        <Button asChild>
          <Link href="/student/enrollments">View my enrollments</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function CourseRegistrationSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <Skeleton className="h-6 w-52" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {["course-a", "course-b", "course-c"].map((key) => (
            <Skeleton key={key} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    </div>
  );
}
