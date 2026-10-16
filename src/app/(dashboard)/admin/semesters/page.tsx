import { CalendarDays } from "lucide-react";
import type { Metadata } from "next";
import { EntityDeleteButton } from "@/components/admin/entity-delete-button";
import { SemesterFormDialog } from "@/components/admin/semester-form-dialog";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { TablePagination } from "@/components/shared/table-pagination";
import { deleteSemesterAction, saveSemesterAction } from "@/lib/admin/actions";
import { listAllSemesters } from "@/lib/admin/service";
import { requireRole } from "@/lib/auth/roles";
import { formatDate } from "@/lib/format";
import { readPage } from "@/lib/search-params";
import type { AdminSemester } from "@/types/entities";

export const metadata: Metadata = { title: "Semesters" };

export default async function AdminSemestersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const params = await searchParams;
  const raw = params.year;
  const year = Array.isArray(raw) ? raw[0] : raw;
  const page = readPage(params.page);

  const semesters = await listAllSemesters({ year, page, limit: 10 });

  const columns: DataTableColumn<AdminSemester>[] = [
    {
      id: "semester",
      header: "Semester",
      cell: (semester) => (
        <div className="space-y-1">
          <p className="font-medium">
            {semester.name} {semester.year}
          </p>
          {semester.isActive ? <StatusBadge status="ACTIVE" /> : null}
        </div>
      ),
    },
    {
      id: "dates",
      header: "Duration",
      cell: (semester) => (
        <div className="space-y-0.5">
          <p className="font-mono text-xs">
            {formatDate(semester.startDate)} - {formatDate(semester.endDate)}
          </p>
          {semester.registrationDeadline ? (
            <p className="text-xs text-muted-foreground">
              Registration closes {formatDate(semester.registrationDeadline)}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      id: "usage",
      header: "Usage",
      cell: (semester) => (
        <div className="space-y-0.5 text-xs text-muted-foreground">
          <p>{semester._count?.sections ?? 0} course sections</p>
          <p>{semester._count?.students ?? 0} students</p>
        </div>
      ),
    },
    {
      id: "actions",
      headClassName: "text-right",
      cellClassName: "text-right",
      header: <span className="sr-only">Actions</span>,
      cell: (semester) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <SemesterFormDialog semester={semester} action={saveSemesterAction} />
          <EntityDeleteButton
            action={deleteSemesterAction}
            entityId={semester.id}
            title={`Delete ${semester.name} ${semester.year}?`}
            description="Semesters with course sections cannot be deleted; the backend will explain what to do first."
            confirmLabel="Delete semester"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Semesters"
        description="Academic terms with registration windows. At most one semester is active at a time."
        actions={<SemesterFormDialog action={saveSemesterAction} />}
      />

      <StatCard
        label="Semesters"
        value={semesters.meta.total}
        hint={`${semesters.data.filter((semester) => semester.isActive).length} active on this page`}
        icon={CalendarDays}
        tone="primary"
        className="sm:max-w-xs"
      />

      {semesters.data.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No semesters yet"
          description="Create a semester so students can enroll."
          action={<SemesterFormDialog action={saveSemesterAction} />}
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={semesters.data}
            getRowKey={(semester) => semester.id}
          />
          <TablePagination
            page={semesters.meta.page}
            totalPages={semesters.meta.totalPages}
            total={semesters.meta.total}
          />
        </>
      )}
    </div>
  );
}
