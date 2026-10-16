import { Users } from "lucide-react";
import type { Metadata } from "next";
import { EntityDeleteButton } from "@/components/admin/entity-delete-button";
import { StudentSectionFormDialog } from "@/components/admin/student-section-form-dialog";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { TableFilter } from "@/components/shared/table-filter";
import { TablePagination } from "@/components/shared/table-pagination";
import {
  deleteStudentSectionAction,
  saveStudentSectionAction,
} from "@/lib/admin/actions";
import { listAllStudentSections } from "@/lib/admin/service";
import { requireRole } from "@/lib/auth/roles";
import { listPrograms } from "@/lib/catalog/service";
import { readPage } from "@/lib/search-params";
import type { StudentSectionAdmin } from "@/types/entities";

export const metadata: Metadata = { title: "Student sections" };

export default async function AdminStudentSectionsPage({
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
  const programId = read("programId");
  const page = readPage(params.page);

  const [sections, programs] = await Promise.all([
    listAllStudentSections({ programId, page, limit: 10 }),
    listPrograms({ limit: 100 }),
  ]);

  const programOptions = programs.data.map((program) => ({
    value: program.id,
    label: `${program.degreeType} - ${program.name}`,
  }));
  const programName = new Map(
    programs.data.map((program) => [program.id, program.name]),
  );

  const columns: DataTableColumn<StudentSectionAdmin>[] = [
    {
      id: "section",
      header: "Section",
      cell: (section) => (
        <div className="space-y-0.5">
          <span className="inline-flex w-fit items-center rounded-md border border-border bg-card px-2 py-0.5 font-mono text-xs font-medium tracking-tight text-foreground">
            {section.sectionCode}
          </span>
          <p className="truncate text-xs text-muted-foreground">
            {section.program?.name ?? programName.get(section.programId) ?? ""}
          </p>
        </div>
      ),
    },
    {
      id: "year",
      header: "Enrollment year",
      cell: (section) => (
        <span className="font-mono">{section.enrollmentYear}</span>
      ),
    },
    {
      id: "seats",
      header: "Seats",
      cell: (section) => (
        <div className="space-y-0.5">
          <p className="font-mono">
            {section.enrolledCount ?? 0}/{section.capacity}
          </p>
          {section.seatsAvailable !== undefined ? (
            <p className="text-xs text-muted-foreground">
              {section.seatsAvailable} available
            </p>
          ) : null}
        </div>
      ),
    },
    {
      id: "actions",
      headClassName: "text-right",
      cellClassName: "text-right",
      header: <span className="sr-only">Actions</span>,
      cell: (section) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <StudentSectionFormDialog
            section={section}
            programOptions={programOptions}
            action={saveStudentSectionAction}
          />
          <EntityDeleteButton
            action={deleteStudentSectionAction}
            entityId={section.id}
            title={`Delete section ${section.sectionCode}?`}
            description="Sections with assigned students cannot be deleted until they are reassigned."
            confirmLabel="Delete section"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student sections"
        description="Cohorts of one program and enrollment year. Approvals assign students here when seats are free."
        actions={
          <StudentSectionFormDialog
            programOptions={programOptions}
            action={saveStudentSectionAction}
          />
        }
      />

      <StatCard
        label="Student sections"
        value={sections.meta.total}
        hint={`Page ${sections.meta.page} of ${Math.max(sections.meta.totalPages, 1)}`}
        icon={Users}
        tone="primary"
        className="sm:max-w-xs"
      />

      <TableFilter
        paramKey="programId"
        label="Filter by program"
        allLabel="All programs"
        options={programOptions}
        className="sm:w-64"
      />

      {sections.data.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No student sections yet"
          description={
            programOptions.length === 0
              ? "Create a program first."
              : "Create a section so approved students can be grouped."
          }
          action={
            programOptions.length === 0 ? undefined : (
              <StudentSectionFormDialog
                programOptions={programOptions}
                action={saveStudentSectionAction}
              />
            )
          }
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={sections.data}
            getRowKey={(section) => section.id}
          />
          <TablePagination
            page={sections.meta.page}
            totalPages={sections.meta.totalPages}
            total={sections.meta.total}
          />
        </>
      )}
    </div>
  );
}
