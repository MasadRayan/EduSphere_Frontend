import {
  Building2,
  CalendarCheck,
  ClipboardCheck,
  GraduationCap,
  Layers,
  Receipt,
  UserPlus,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import { AdminAnalyticsCharts } from "@/components/admin/admin-analytics-charts";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { getAdminAnalytics } from "@/lib/admin/service";
import { requireRole } from "@/lib/auth/roles";

export const metadata: Metadata = { title: "Admin dashboard" };

export default async function AdminDashboardPage() {
  await requireRole("ADMIN", "SUPER_ADMIN");

  const analytics = await getAdminAnalytics();

  const hasData =
    analytics.users.totalStudents > 0 ||
    analytics.applications.student.total > 0 ||
    analytics.applications.instructor.total > 0 ||
    analytics.academics.courses > 0;

  const pendingStudent = analytics.applications.student.pending;
  const pendingInstructor = analytics.applications.instructor.pending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin dashboard"
        description="Institutions-wide snapshot of admissions, academics, enrollments and finance."
      />

      {!hasData ? (
        <EmptyState
          icon={Building2}
          title="Nothing to report yet"
          description="Once departments, applications and enrollments exist, the overview appears here. Start by creating a department and a semester."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Students"
              value={analytics.users.totalStudents}
              hint={`${analytics.enrollments.enrolledEnrollments} enrolled this cycle`}
              icon={Users}
              tone="primary"
            />
            <StatCard
              label="Instructors"
              value={analytics.users.totalInstructors}
              hint={`${analytics.academics.departments} departments`}
              icon={GraduationCap}
            />
            <StatCard
              label="Pending student applications"
              value={pendingStudent}
              hint={`${analytics.applications.student.total} in total`}
              icon={ClipboardCheck}
              tone={pendingStudent > 0 ? "warning" : "default"}
            />
            <StatCard
              label="Pending instructor applications"
              value={pendingInstructor}
              hint={`${analytics.applications.instructor.total} in total`}
              icon={UserPlus}
              tone={pendingInstructor > 0 ? "warning" : "default"}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Net revenue"
              value={analytics.finance.netRevenue.toLocaleString()}
              hint={`${analytics.finance.totalRefunded.toLocaleString()} refunded`}
              icon={Receipt}
              tone="success"
            />
            <StatCard
              label="Attendance rate"
              value={`${analytics.assessment.attendanceRate}%`}
              hint={`${analytics.assessment.presentRecords} of ${analytics.assessment.attendanceRecords} records present`}
              icon={CalendarCheck}
            />
            <StatCard
              label="Course sections"
              value={analytics.enrollments.courseSections}
              hint={`${analytics.academics.courses} courses, ${analytics.academics.programs} programs`}
              icon={Layers}
            />
            <StatCard
              label="Active semesters"
              value={analytics.academics.activeSemesters}
              hint={`${analytics.academics.semesters} semesters total`}
              icon={Building2}
              tone="primary"
            />
          </div>

          <AdminAnalyticsCharts analytics={analytics} />
        </>
      )}
    </div>
  );
}
