import { School } from "lucide-react";
import type { Metadata } from "next";
import { EntityDeleteButton } from "@/components/admin/entity-delete-button";
import { ProgramFormDialog } from "@/components/admin/program-form-dialog";
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
import { deleteProgramAction, saveProgramAction } from "@/lib/admin/actions";
import { requireRole } from "@/lib/auth/roles";
import { listDepartments, listPrograms } from "@/lib/catalog/service";
import { readPage } from "@/lib/search-params";
import type { Program } from "@/types/entities";

export const metadata: Metadata = { title: "Programs" };

export default async function AdminProgramsPage({
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

  const [departments, programs] = await Promise.all([
    listDepartments(),
    listPrograms({ searchTerm, departmentId, page, limit: 10 }),
  ]);

  const departmentById = new Map(
    departments.data.map((department) => [department.id, department]),
  );
  const departmentOptions = departments.data.map((department) => ({
    value: department.id,
    label: `${department.code} - ${department.name}`,
  }));

  const columns: DataTableColumn<Program>[] = [
    {
      id: "name",
      header: "Program",
      cell: (program) => (
        <div className="space-y-0.5">
          <p className="font-medium">{program.name}</p>
          <p className="text-xs text-muted-foreground">{program.degreeType}</p>
        </div>
      ),
    },
    {
      id: "credits",
      header: "Total credits",
      cell: (program) => (
        <span className="font-mono">{program.totalCredits}</span>
      ),
    },
    {
      id: "department",
      header: "Department",
      cell: (program) => {
        const department =
          program.department ?? departmentById.get(program.departmentId);
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
      id: "actions",
      headClassName: "text-right",
      cellClassName: "text-right",
      header: <span className="sr-only">Actions</span>,
      cell: (program) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <ProgramFormDialog
            program={program}
            departmentOptions={departmentOptions}
            action={saveProgramAction}
          />
          <EntityDeleteButton
            action={deleteProgramAction}
            entityId={program.id}
            title={`Delete ${program.name}?`}
            description="This permanently deletes the program and cascades to student sections and applications referencing it. This cannot be undone."
            confirmLabel="Delete program"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Programs"
        description="Degrees students apply to, each owned by a department."
        actions={
          <ProgramFormDialog
            departmentOptions={departmentOptions}
            action={saveProgramAction}
          />
        }
      />

      <StatCard
        label="Programs"
        value={programs.meta.total}
        hint={`Page ${programs.meta.page} of ${Math.max(programs.meta.totalPages, 1)}`}
        icon={School}
        tone="primary"
        className="sm:max-w-xs"
      />

      <div className="flex flex-wrap items-center gap-2">
        <TableSearch placeholder="Search program name" className="sm:w-64" />
        <TableFilter
          paramKey="departmentId"
          label="Filter by department"
          allLabel="All departments"
          options={departmentOptions}
        />
      </div>

      {programs.data.length === 0 ? (
        <EmptyState
          icon={School}
          title="No programs yet"
          description={
            departmentOptions.length === 0
              ? "Create a department first, then add programs."
              : "Create a program so students have something to apply to."
          }
          action={
            departmentOptions.length === 0 ? undefined : (
              <ProgramFormDialog
                departmentOptions={departmentOptions}
                action={saveProgramAction}
              />
            )
          }
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={programs.data}
            getRowKey={(program) => program.id}
          />
          <TablePagination
            page={programs.meta.page}
            totalPages={programs.meta.totalPages}
            total={programs.meta.total}
          />
        </>
      )}
    </div>
  );
}
