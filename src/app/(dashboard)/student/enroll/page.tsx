import type { Metadata } from "next";
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
import { requireRole } from "@/lib/auth/roles";
import { firstParam, type SearchParamsInput } from "@/lib/search-params";
import {
  getActiveSemester,
  getMyEnrollments,
  getRegisteredCourses,
  listEnrollCourses,
  listOfferedSections,
} from "@/lib/student/service";
import type { Semester } from "@/types/entities";
import type { EnrollmentStatus } from "@/types/enums";

export const metadata: Metadata = { title: "Enroll in courses" };

export default async function StudentEnrollPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  await requireRole("STUDENT");

  const params = await searchParams;
  const preselectCourseId = firstParam(params.courseId);

  const semester = await getActiveSemester();

  if (!semester) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Enroll in courses"
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
    return (
      <AlreadyEnrolled semester={semester} enrollment={activeEnrollment} />
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
      <PageHeader
        title="Enroll in courses"
        description={`Build your schedule for ${semester.name}. Sections shown for reference; the registrar assigns your section on enrollment.`}
      />
      <CoursePicker
        semester={semester}
        courses={courses}
        sections={sections}
        completedCourseIds={completedCourseIds}
        enrolledCourseIds={enrolledCourseIds}
        initialCourseIds={preselectCourseId ? [preselectCourseId] : []}
      />
    </div>
  );
}

function AlreadyEnrolled({
  semester,
  enrollment,
}: {
  semester: Semester;
  enrollment: { id: string; status: EnrollmentStatus };
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Enroll in courses"
        description={`Build your schedule for ${semester.name}.`}
      />
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
    </div>
  );
}
