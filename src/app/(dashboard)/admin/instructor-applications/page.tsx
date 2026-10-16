import { ExternalLink, UserPlus } from "lucide-react";
import type { Metadata } from "next";
import { ApproveInstructorDialog } from "@/components/admin/approve-instructor-dialog";
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
import { Button } from "@/components/ui/button";
import {
  approveInstructorApplicationAction,
  rejectInstructorApplicationAction,
} from "@/lib/admin/actions";
import { listInstructorApplications } from "@/lib/admin/service";
import { requireRole } from "@/lib/auth/roles";
import { listDepartments } from "@/lib/catalog/service";
import { formatDate } from "@/lib/format";
import type { InstructorApplication } from "@/types/entities";
import { APPLICATION_STATUSES } from "@/types/enums";

export const metadata: Metadata = { title: "Instructor applications" };

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export default async function InstructorApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const params = await searchParams;
  const status = Array.isArray(params.status)
    ? params.status[0]
    : params.status;

  const [applications, departments] = await Promise.all([
    listInstructorApplications(status),
    listDepartments(),
  ]);

  const pending = applications.filter(
    (application) => application.status === "PENDING",
  );
  const approved = applications.filter(
    (application) => application.status === "APPROVED",
  );
  const rejected = applications.filter(
    (application) => application.status === "REJECTED",
  );

  const departmentOptions = departments.data.map((department) => ({
    value: department.id,
    label: `${department.code} - ${department.name}`,
  }));

  const columns: DataTableColumn<InstructorApplication>[] = [
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
      id: "designation",
      header: "Designation",
      cell: (application) => (
        <div className="space-y-0.5">
          <p className="font-medium">
            {application.designation ?? "Not stated"}
          </p>
          <p className="text-xs text-muted-foreground">
            {application.department
              ? `${application.department.code} - ${application.department.name}`
              : "No department"}
          </p>
        </div>
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
            {application.resumeUrl ? (
              <Button asChild variant="ghost" size="sm">
                <a
                  href={application.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Resume{" "}
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </a>
              </Button>
            ) : null}
            <ApproveInstructorDialog
              applicationId={application.id}
              applicantName={application.fullName}
              suggestedDesignation={application.designation}
              departmentOptions={departmentOptions}
              action={approveInstructorApplicationAction}
            />
            <RejectApplicationDialog
              applicationId={application.id}
              applicantName={application.fullName}
              action={rejectInstructorApplicationAction}
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
        title="Instructor applications"
        description="Review teaching applications. Approving creates the instructor profile; designation and department can be overridden."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Pending"
          value={pending.length}
          icon={UserPlus}
          tone={pending.length > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Approved"
          value={approved.length}
          icon={UserPlus}
          tone="success"
        />
        <StatCard
          label="Rejected"
          value={rejected.length}
          icon={UserPlus}
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
          icon={UserPlus}
          title="No applications to show"
          description={
            status === "PENDING"
              ? "The pending queue is empty."
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
