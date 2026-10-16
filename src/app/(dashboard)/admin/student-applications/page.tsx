import { ClipboardCheck } from "lucide-react";
import type { Metadata } from "next";
import { ApproveStudentDialog } from "@/components/admin/approve-student-dialog";
import { RejectApplicationDialog } from "@/components/admin/reject-application-dialog";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableFilter } from "@/components/shared/table-filter";
import {
  approveStudentApplicationAction,
  rejectStudentApplicationAction,
} from "@/lib/admin/actions";
import {
  listAllStudentSections,
  listStudentApplications,
} from "@/lib/admin/service";
import { requireRole } from "@/lib/auth/roles";
import { listSemesters } from "@/lib/catalog/service";
import { formatDate } from "@/lib/format";
import type { StudentApplication } from "@/types/entities";
import { APPLICATION_STATUSES } from "@/types/enums";

export const metadata: Metadata = { title: "Student applications" };

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export default async function StudentApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const params = await searchParams;
  const status = Array.isArray(params.status)
    ? params.status[0]
    : params.status;

  const [applications, semesters, sectionPage] = await Promise.all([
    listStudentApplications(status),
    listSemesters(),
    listAllStudentSections({ limit: 100 }),
  ]);
  const sections = sectionPage.data;

  const pending = applications.filter(
    (application) => application.status === "PENDING",
  );
  const approved = applications.filter(
    (application) => application.status === "APPROVED",
  );
  const rejected = applications.filter(
    (application) => application.status === "REJECTED",
  );

  const semesterOptions = semesters.map((semester) => ({
    value: semester.id,
    label: `${semester.name} ${semester.year}`,
  }));

  const columns: DataTableColumn<StudentApplication>[] = [
    {
      id: "applicant",
      header: "Applicant",
      cell: (application) => (
        <div className="space-y-0.5">
          <p className="font-medium">{application.fullName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {application.user?.email ?? application.userId}
          </p>
        </div>
      ),
    },
    {
      id: "program",
      header: "Program",
      cell: (application) => (
        <div className="space-y-0.5">
          <span className="inline-flex w-fit items-center rounded-md border border-border bg-card px-2 py-0.5 font-mono text-xs font-medium tracking-tight text-foreground">
            {application.department?.code ?? "Dept"}
          </span>
          <p className="truncate text-xs text-muted-foreground">
            {application.program?.name ?? ""}
          </p>
        </div>
      ),
    },
    {
      id: "year",
      header: "Enrollment year",
      cell: (application) => (
        <span className="font-mono">{application.enrollmentYear}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (application) => <StatusBadge status={application.status} />,
    },
    {
      id: "review",
      header: "Reviewed",
      cell: (application) =>
        application.reviewedAt ? (
          <div className="space-y-0.5">
            <p className="font-mono text-xs">
              {formatDate(application.reviewedAt)}
            </p>
            {application.reviewNote ? (
              <p className="max-w-48 truncate text-xs text-muted-foreground">
                {application.reviewNote}
              </p>
            ) : null}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        ),
    },
    {
      id: "actions",
      headClassName: "text-right",
      cellClassName: "text-right",
      header: <span className="sr-only">Actions</span>,
      cell: (application) =>
        application.status === "PENDING" ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <ApproveStudentDialog
              applicationId={application.id}
              applicantName={application.fullName}
              programId={application.programId}
              enrollmentYear={application.enrollmentYear}
              action={approveStudentApplicationAction}
              semesterOptions={semesterOptions}
              sections={sections}
            />
            <RejectApplicationDialog
              applicationId={application.id}
              applicantName={application.fullName}
              action={rejectStudentApplicationAction}
            />
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Reviewed</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student applications"
        description="Review admission applications. Approving creates the student profile; a unique roll number is required."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Pending"
          value={pending.length}
          icon={ClipboardCheck}
          tone={pending.length > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Approved"
          value={approved.length}
          icon={ClipboardCheck}
          tone="success"
        />
        <StatCard
          label="Rejected"
          value={rejected.length}
          icon={ClipboardCheck}
          tone="danger"
        />
      </div>

      <TableFilter
        paramKey="status"
        label="Filter by status"
        options={APPLICATION_STATUSES.map((value) => ({
          value,
          label: STATUS_LABELS[value],
        }))}
      />

      {applications.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No applications to show"
          description={
            status === "PENDING"
              ? "The pending queue is empty. New applications appear here as students apply."
              : "No applications match this filter yet."
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={applications}
          getRowKey={(application) => application.id}
        />
      )}
    </div>
  );
}
