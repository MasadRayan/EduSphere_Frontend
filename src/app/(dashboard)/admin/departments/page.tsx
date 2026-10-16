import { Building2 } from "lucide-react";
import type { Metadata } from "next";
import { DepartmentFormDialog } from "@/components/admin/department-form-dialog";
import { EntityDeleteButton } from "@/components/admin/entity-delete-button";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { TablePagination } from "@/components/shared/table-pagination";
import { TableSearch } from "@/components/shared/table-search";
import {
  deleteDepartmentAction,
  saveDepartmentAction,
} from "@/lib/admin/actions";
import { requireRole } from "@/lib/auth/roles";
import { listDepartments } from "@/lib/catalog/service";
import { readPage } from "@/lib/search-params";
import type { Department } from "@/types/entities";

export const metadata: Metadata = { title: "Departments" };

export default async function AdminDepartmentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const params = await searchParams;
  const raw = params.searchTerm;
  const searchTerm = Array.isArray(raw) ? raw[0] : raw;
  const page = readPage(params.page);

  const departments = await listDepartments({ searchTerm, page, limit: 10 });

  const columns: DataTableColumn<Department>[] = [
    {
      id: "code",
      header: "Code",
      cell: (department) => (
        <span className="inline-flex items-center rounded-md border border-border bg-card px-2 py-0.5 font-mono text-xs font-medium tracking-tight text-foreground">
          {department.code}
        </span>
      ),
    },
    {
      id: "name",
      header: "Name",
      cell: (department) => <p className="font-medium">{department.name}</p>,
    },
    {
      id: "actions",
      headClassName: "text-right",
      cellClassName: "text-right",
      header: <span className="sr-only">Actions</span>,
      cell: (department) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <DepartmentFormDialog
            department={department}
            action={saveDepartmentAction}
          />
          <EntityDeleteButton
            action={deleteDepartmentAction}
            entityId={department.id}
            title={`Delete ${department.name}?`}
            description="This permanently deletes the department and cascades to its programs, courses and instructor profiles. This cannot be undone."
            confirmLabel="Delete department"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Top-level academic units. Programs, courses and instructor profiles all belong to a department."
        actions={<DepartmentFormDialog action={saveDepartmentAction} />}
      />

      <StatCard
        label="Departments"
        value={departments.meta.total}
        hint={`Page ${departments.meta.page} of ${Math.max(departments.meta.totalPages, 1)}`}
        icon={Building2}
        tone="primary"
        className="sm:max-w-xs"
      />

      <TableSearch placeholder="Search name or code" className="sm:w-64" />

      {departments.data.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No departments yet"
          description="Create the first department to unlock programs, courses and instructor applications."
          action={<DepartmentFormDialog action={saveDepartmentAction} />}
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={departments.data}
            getRowKey={(department) => department.id}
          />
          <TablePagination
            page={departments.meta.page}
            totalPages={departments.meta.totalPages}
            total={departments.meta.total}
          />
        </>
      )}
    </div>
  );
}
