import { BookOpen } from "lucide-react";
import Link from "next/link";
import { CourseCodeTag } from "@/components/shared/course-code-tag";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableFilter } from "@/components/shared/table-filter";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/roles";
import { formatDate } from "@/lib/format";
import { firstParam } from "@/lib/search-params";
import { getRegisteredCourses } from "@/lib/student/service";
import type { CourseRegistration } from "@/types/entities";

export default async function StudentCoursesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole("STUDENT");
  const params = await searchParams;
  const semesterId = firstParam(params.semesterId);
  const status = firstParam(params.status);

  const registrations = await getRegisteredCourses();
  const filtered = registrations.filter(
    (registration) =>
      (!semesterId || registration.courseSection.semesterId === semesterId) &&
      (!status || registration.status === status),
  );

  const semesters = Array.from(
    new Map(
      registrations.map((registration) => [
        registration.courseSection.semesterId,
        registration.courseSection.semester,
      ]),
    ).entries(),
  )
    .map(([id, semester]) => ({ id, semester }))
    .filter((entry) => entry.semester)
    .sort((a, b) => (b.semester?.year ?? 0) - (a.semester?.year ?? 0));

  const columns: DataTableColumn<CourseRegistration>[] = [
    {
      id: "course",
      header: "Course",
      cell: (registration) => {
        const course = registration.courseSection.course;
        if (!course) {
          return "-";
        }
        return (
          <div className="space-y-0.5">
            <CourseCodeTag code={course.code} />
            <p className="font-medium">{course.title}</p>
          </div>
        );
      },
    },
    {
      id: "section",
      header: "Section",
      cell: (registration) => (
        <span className="font-mono text-xs">
          {registration.courseSection.sectionCode}
        </span>
      ),
    },
    {
      id: "semester",
      header: "Semester",
      cell: (registration) => {
        const semester = registration.courseSection.semester;
        return semester ? `${semester.name} ${semester.year}` : "-";
      },
    },
    {
      id: "instructor",
      header: "Instructor",
      cell: (registration) => (
        <span>{registration.courseSection.instructor?.user.name ?? "-"}</span>
      ),
    },
    {
      id: "credits",
      header: "Credits",
      cell: (registration) => (
        <span className="font-mono">
          {registration.courseSection.course?.creditHours ?? 0}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (registration) => <StatusBadge status={registration.status} />,
    },
    {
      id: "registered",
      header: "Registered",
      cell: (registration) => (
        <span className="text-muted-foreground">
          {formatDate(registration.registeredAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: <span className="sr-only">View</span>,
      headClassName: "text-right",
      cellClassName: "text-right",
      cell: (registration) => (
        <Button asChild variant="ghost" size="sm">
          <Link href={`/student/courses/${registration.id}`}>View detail</Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My courses"
        description="Every course you are enrolled in this year, current or completed."
      />

      <div className="flex flex-wrap gap-2">
        <TableFilter
          paramKey="semesterId"
          label="Filter by semester"
          allLabel="All semesters"
          options={semesters.map(({ id, semester }) => ({
            value: id,
            label: `${semester?.name ?? ""} ${semester?.year ?? ""}`,
          }))}
        />
        <TableFilter
          paramKey="status"
          label="Filter by status"
          allLabel="All statuses"
          options={[
            { value: "ENROLLED", label: "Enrolled" },
            { value: "COMPLETED", label: "Completed" },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        getRowKey={(registration) => registration.id}
        empty={
          <EmptyState
            icon={BookOpen}
            title="No registered courses"
            description="Courses you enroll in each semester appear here with their section and status."
            action={
              <Button asChild>
                <Link href="/student/enroll">Enroll in courses</Link>
              </Button>
            }
          />
        }
      />
    </div>
  );
}
