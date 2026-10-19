import {
  BookOpen,
  CalendarCheck,
  CreditCard,
  GraduationCap,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { TableFilter } from "@/components/shared/table-filter";
import {
  CourseRegistrationSection,
  CourseRegistrationSkeleton,
} from "@/components/student/course-registration";
import { DashboardCharts } from "@/components/student/dashboard-charts";
import { Button } from "@/components/ui/button";
import { requireStudentProfile } from "@/lib/auth/roles";
import { formatCurrency } from "@/lib/format";
import { firstParam } from "@/lib/search-params";
import { getStudentAnalytics, listSemesters } from "@/lib/student/service";

export const metadata: Metadata = { title: "Student dashboard" };

export default async function StudentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireStudentProfile();
  const params = await searchParams;
  const semesterId = firstParam(params.semesterId);

  const [analytics, semesters] = await Promise.all([
    getStudentAnalytics({ semesterId }),
    listSemesters(),
  ]);

  const hasAcademicData =
    analytics.academic.completedCourses > 0 ||
    analytics.academic.coursesInProgress > 0 ||
    analytics.attendance.totalClasses > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student dashboard"
        description="Your CGPA, credits, attendance and spend at a glance."
      />

      <TableFilter
        paramKey="semesterId"
        label="Filter by semester"
        allLabel="All semesters"
        options={semesters.map((semester) => ({
          value: semester.id,
          label: `${semester.name} ${semester.year}`,
        }))}
      />

      {!hasAcademicData ? (
        <EmptyState
          icon={BookOpen}
          title="Nothing to report yet"
          description="Once you enroll in a semester and attend classes, your academic summary appears here."
          action={
            <Button asChild>
              <Link href="/student/enroll">Enroll in courses</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="CGPA"
              value={analytics.academic.cgpa.toFixed(2)}
              hint={`${analytics.academic.completedCourses} courses completed`}
              icon={GraduationCap}
              tone="warning"
            />
            <StatCard
              label="Credits completed"
              value={analytics.academic.totalCreditsCompleted}
              hint={`${analytics.academic.inProgressCredits} in progress`}
              icon={BookOpen}
              tone="primary"
            />
            <StatCard
              label="Attendance"
              value={`${analytics.attendance.attendancePercentage}%`}
              hint={`${analytics.attendance.attendedClasses} of ${analytics.attendance.totalClasses} classes`}
              icon={CalendarCheck}
              tone="success"
            />
            <StatCard
              label="Total spent"
              value={formatCurrency(analytics.finance.totalAmountSpent)}
              hint={`Refunded ${formatCurrency(analytics.finance.totalRefunded)}`}
              icon={CreditCard}
            />
          </div>

          <DashboardCharts analytics={analytics} />
        </>
      )}

      <Suspense fallback={<CourseRegistrationSkeleton />}>
        <CourseRegistrationSection variant="dashboard" />
      </Suspense>
    </div>
  );
}
