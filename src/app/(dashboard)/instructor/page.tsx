import { CalendarCheck, ClipboardList, Layers, Users } from "lucide-react";
import type { Metadata } from "next";
import { DashboardCharts } from "@/components/instructor/dashboard-charts";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { TableFilter } from "@/components/shared/table-filter";
import { requireInstructorProfile } from "@/lib/auth/roles";
import { getInstructorAnalytics } from "@/lib/instructor/service";
import { firstParam } from "@/lib/search-params";
import { listSemesters } from "@/lib/student/service";

export const metadata: Metadata = { title: "Instructor dashboard" };

export default async function InstructorDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireInstructorProfile();
  const params = await searchParams;
  const semesterId = firstParam(params.semesterId);

  const [analytics, semesters] = await Promise.all([
    getInstructorAnalytics({ semesterId }),
    listSemesters(),
  ]);

  const hasData =
    analytics.sections.totalSections > 0 ||
    analytics.attendance.totalRecords > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Instructor dashboard"
        description="Your sections, seat fill rate, exams and grading queue."
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

      {!hasData ? (
        <EmptyState
          icon={Layers}
          title="Nothing to report yet"
          description="Once the admin assigns course sections to you, your teaching summary appears here."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Seat fill rate"
              value={`${analytics.sections.fillRate}%`}
              hint={`${analytics.sections.seatsFilled} of ${analytics.sections.totalCapacity} seats`}
              icon={Layers}
              tone="primary"
            />
            <StatCard
              label="Students"
              value={analytics.students.totalStudentsEnrolled}
              hint={`${analytics.sections.totalCoursesTaught} courses in ${analytics.sections.totalSections} sections`}
              icon={Users}
            />
            <StatCard
              label="Upcoming exams"
              value={analytics.exams.upcomingExams}
              hint={`${analytics.exams.totalExams} exams in total`}
              icon={ClipboardList}
              tone="warning"
            />
            <StatCard
              label="Pending grading"
              value={analytics.exams.pendingGrading}
              hint={`${analytics.grading.totalGradeEntries} grade entries recorded`}
              icon={CalendarCheck}
              tone="warning"
            />
          </div>

          <DashboardCharts analytics={analytics} />
        </>
      )}
    </div>
  );
}
