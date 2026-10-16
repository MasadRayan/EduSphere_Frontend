import { UserCog } from "lucide-react";
import type { Metadata } from "next";
import { EntityDeleteButton } from "@/components/admin/entity-delete-button";
import { InstructorEditDialog } from "@/components/admin/instructor-edit-dialog";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { TableFilter } from "@/components/shared/table-filter";
import { TablePagination } from "@/components/shared/table-pagination";
import { TableSearch } from "@/components/shared/table-search";
import {
  deleteInstructorAdminAction,
  updateInstructorAdminAction,
} from "@/lib/admin/actions";
import { listInstructors } from "@/lib/admin/service";
import { requireRole } from "@/lib/auth/roles";
import { listDepartments } from "@/lib/catalog/service";
import { readPage } from "@/lib/search-params";
import type { InstructorAdminRow } from "@/types/entities";

export const metadata: Metadata = { title: "Instructors" };

export default async function AdminInstructorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const params = await searchParams;
  const read = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const searchTerm = read("searchTerm");
  const departmentId = read("departmentId");
  const page = readPage(params.page);

  const [departments, instructors] = await Promise.all([
    listDepartments(),
    listInstructors({ searchTerm, departmentId, page, limit: 10 }),
  ]);

  const departmentOptions = departments.data.map((department) => ({
    value: department.id,
    label: `${department.code} - ${department.name}`,
  }));
  const departmentById = new Map(
    departments.data.map((department) => [department.id, department]),
  );

  const columns: DataTableColumn<InstructorAdminRow>[] = [
    {
      id: "instructor",
      header: "Instructor",
      cell: (instructor) => (
        <div className="space-y-0.5">
          <p className="font-medium">{instructor.fullName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {instructor.user?.email ?? instructor.userId}
          </p>
        </div>
      ),
    },
    {
      id: "designation",
      header: "Designation",
      cell: (instructor) => (
        <p className="font-medium">{instructor.designation ?? "Not set"}</p>
      ),
    },
    {
      id: "department",
      header: "Department",
      cell: (instructor) => {
        const department =
          instructor.department ?? departmentById.get(instructor.departmentId);
        return (
          <div className="space-y-0.5">
            <span className="inline-flex w-fit items-center rounded-md border border-border bg-card px-2 py-0.5 font-mono text-xs font-medium tracking-tight text-foreground">
              {department?.code ?? "Dept"}
            </span>
            <p className="truncate text-xs text-muted-foreground">
              {department?.name ?? ""}
            </p>
          </div>
        );
      },
    },
    {
      id: "sections",
      header: "Course sections",
      cell: (instructor) => (
        <span className="font-mono">
          {instructor._count?.courseSections ?? 0}
        </span>
      ),
    },
    {
      id: "actions",
      headClassName: "text-right",
      cellClassName: "text-right",
      header: <span className="sr-only">Actions</span>,
      cell: (instructor) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <InstructorEditDialog
            instructor={instructor}
            departmentOptions={departmentOptions}
            action={updateInstructorAdminAction}
          />
          <EntityDeleteButton
            action={deleteInstructorAdminAction}
            entityId={instructor.id}
            title={`Delete ${instructor.fullName}?`}
            description="This removes the instructor profile. Their account stays, and assigned course sections are unassigned."
            confirmLabel="Delete instructor"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Instructors"
        description="Manage instructor profiles created from approved applications. Instructors are added through the application queue, not directly."
      />

      <StatCard
        label="Instructors"
        value={instructors.meta.total}
        hint={`Page ${instructors.meta.page} of ${Math.max(instructors.meta.totalPages, 1)}`}
        icon={UserCog}
        tone="primary"
        className="sm:max-w-xs"
      />

      <div className="flex flex-wrap items-center gap-2">
        <TableSearch placeholder="Search instructor name" className="sm:w-64" />
        <TableFilter
          paramKey="departmentId"
          label="Filter by department"
          allLabel="All departments"
          options={departmentOptions}
        />
      </div>

      {instructors.data.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="No instructors found"
          description="Approve instructor applications to create instructor profiles."
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={instructors.data}
            getRowKey={(instructor) => instructor.id}
          />
          <TablePagination
            page={instructors.meta.page}
            totalPages={instructors.meta.totalPages}
            total={instructors.meta.total}
          />
        </>
      )}
    </div>
  );
}
