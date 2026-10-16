import { BarChart3, ClipboardList, GraduationCap, Receipt } from "lucide-react";
import type { Metadata } from "next";
import { AdminAnalyticsCharts } from "@/components/admin/admin-analytics-charts";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { TableFilter } from "@/components/shared/table-filter";
import { getAdminAnalytics } from "@/lib/admin/service";
import { requireRole } from "@/lib/auth/roles";
import { listSemesters } from "@/lib/catalog/service";
import { firstParam } from "@/lib/search-params";

export const metadata: Metadata = { title: "Analytics" };

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const params = await searchParams;
  const semesterId = firstParam(params.semesterId);
  const startDate = firstParam(params.startDate);
  const endDate = firstParam(params.endDate);

  const [analytics, semesters] = await Promise.all([
    getAdminAnalytics({ semesterId, startDate, endDate }),
    listSemesters(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Institution-wide numbers for admissions, academics, enrollments, assessment and finance. Filter by semester and date range; both dates are inclusive."
      />

      <div className="flex flex-wrap items-center gap-2">
        <TableFilter
          paramKey="semesterId"
          label="Filter by semester"
          allLabel="All semesters"
          options={semesters.map((semester) => ({
            value: semester.id,
            label: `${semester.name} ${semester.year}`,
          }))}
        />
        <DateRangeFilter />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Students"
          value={analytics.users.totalStudents}
          icon={BarChart3}
          tone="primary"
        />
        <StatCard
          label="Instructors"
          value={analytics.users.totalInstructors}
          icon={BarChart3}
        />
        <StatCard
          label="Departments"
          value={analytics.academics.departments}
          hint={`${analytics.academics.programs} programs`}
          icon={BarChart3}
        />
        <StatCard
          label="Courses"
          value={analytics.academics.courses}
          hint={`${analytics.academics.semesters} semesters, ${analytics.academics.activeSemesters} active`}
          icon={BarChart3}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Semester enrollments"
          value={analytics.enrollments.semesterEnrollments}
          hint={`${analytics.enrollments.enrolledEnrollments} currently enrolled`}
          icon={ClipboardList}
        />
        <StatCard
          label="Course registrations"
          value={analytics.enrollments.courseRegistrations}
          hint={`${analytics.enrollments.completedRegistrations} completed`}
          icon={ClipboardList}
        />
        <StatCard
          label="Attendance rate"
          value={`${analytics.assessment.attendanceRate}%`}
          hint={`${analytics.assessment.attendanceRecords} records marked`}
          icon={GraduationCap}
          tone="success"
        />
        <StatCard
          label="Results recorded"
          value={analytics.assessment.results}
          hint={`${analytics.assessment.exams} exams scheduled`}
          icon={GraduationCap}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total revenue"
          value={analytics.finance.totalRevenue.toLocaleString()}
          icon={Receipt}
          tone="success"
        />
        <StatCard
          label="Refunded"
          value={analytics.finance.totalRefunded.toLocaleString()}
          icon={Receipt}
          tone="danger"
        />
        <StatCard
          label="Net revenue"
          value={analytics.finance.netRevenue.toLocaleString()}
          icon={Receipt}
          tone="success"
        />
      </div>

      <AdminAnalyticsCharts analytics={analytics} />
    </div>
  );
}
