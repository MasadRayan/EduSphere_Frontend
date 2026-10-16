import { UserRound } from "lucide-react";
import type { Metadata } from "next";
import {
  AssignSectionDialog,
  SetSemesterDialog,
  UpdateStatusDialog,
} from "@/components/admin/student-controls";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { TablePagination } from "@/components/shared/table-pagination";
import { TableSearch } from "@/components/shared/table-search";
import { listAllStudentSections, listUsers } from "@/lib/admin/service";
import { requireRole } from "@/lib/auth/roles";
import { listSemesters } from "@/lib/catalog/service";
import { readPage } from "@/lib/search-params";
import type { AdminUserRow } from "@/types/entities";

export const metadata: Metadata = { title: "Students" };

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const params = await searchParams;
  const searchTermRaw = params.searchTerm;
  const searchTerm = Array.isArray(searchTermRaw)
    ? searchTermRaw[0]
    : searchTermRaw;
  const page = readPage(params.page);

  const [students, semesters, sectionPage] = await Promise.all([
    listUsers({ role: "STUDENT", searchTerm, page, limit: 10 }),
    listSemesters(),
    listAllStudentSections({ limit: 100 }),
  ]);
  const sections = sectionPage.data;

  const semesterOptions = semesters.map((semester) => ({
    value: semester.id,
    label: `${semester.name} ${semester.year}`,
  }));
  const sectionOptions = sections.map((section) => ({
    value: section.id,
    label: `${section.sectionCode} - ${
      section.program?.name ?? "Program"
    } ${section.enrollmentYear}${
      section.enrolledCount !== undefined
        ? ` (${section.enrolledCount}/${section.capacity} seats)`
        : ""
    }`,
  }));

  const columns: DataTableColumn<AdminUserRow>[] = [
    {
      id: "student",
      header: "Student",
      cell: (student) => (
        <div className="space-y-0.5">
          <p className="font-medium">{student.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {student.email}
          </p>
        </div>
      ),
    },
    {
      id: "roll",
      header: "Roll number",
      cell: (student) => (
        <span className="font-mono text-xs">
          {student.studentProfile?.studentId ?? "-"}
        </span>
      ),
    },
    {
      id: "cgpa",
      header: "CGPA",
      cell: (student) => (
        <span className="font-mono">
          {student.studentProfile
            ? student.studentProfile.cgpa.toFixed(2)
            : "-"}
        </span>
      ),
    },
    {
      id: "semester",
      header: "Current semester",
      cell: (student) => (
        <span className="text-sm">
          {student.studentProfile?.currentSemester
            ? `${student.studentProfile.currentSemester.name} ${student.studentProfile.currentSemester.year}`
            : "Not set"}
        </span>
      ),
    },
    {
      id: "actions",
      headClassName: "text-right",
      cellClassName: "text-right",
      header: <span className="sr-only">Actions</span>,
      cell: (student) => {
        const profileId = student.studentProfile?.id;
        if (!profileId) {
          return (
            <span className="text-xs text-muted-foreground">
              No student profile
            </span>
          );
        }
        return (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <SetSemesterDialog
              profileId={profileId}
              studentName={student.name}
              options={semesterOptions}
            />
            <AssignSectionDialog
              profileId={profileId}
              studentName={student.name}
              options={sectionOptions}
            />
            <UpdateStatusDialog
              profileId={profileId}
              studentName={student.name}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Student profiles with roll number, CGPA and progress. Set the current semester, assign a student section, or update the academic status."
      />

      <StatCard
        label="Students"
        value={students.meta.total}
        hint={`Page ${students.meta.page} of ${Math.max(students.meta.totalPages, 1)}`}
        icon={UserRound}
        tone="primary"
        className="sm:max-w-xs"
      />

      <TableSearch placeholder="Search name or email" className="sm:w-64" />

      {students.data.length === 0 ? (
        <EmptyState
          icon={UserRound}
          title="No students found"
          description="Students appear here once applications are approved."
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={students.data}
            getRowKey={(student) => student.id}
          />
          <TablePagination
            page={students.meta.page}
            totalPages={students.meta.totalPages}
            total={students.meta.total}
          />
        </>
      )}
    </div>
  );
}
