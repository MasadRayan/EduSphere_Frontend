import { ClipboardList } from "lucide-react";
import type { Metadata } from "next";
import { CancelEnrollmentButton } from "@/components/admin/cancel-enrollment-button";
import { OverrideRegistrationDialog } from "@/components/admin/override-registration-dialog";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableFilter } from "@/components/shared/table-filter";
import { TablePagination } from "@/components/shared/table-pagination";
import { listAllRegistrations } from "@/lib/admin/service";
import { requireRole } from "@/lib/auth/roles";
import { listSemesters } from "@/lib/catalog/service";
import { formatDate } from "@/lib/format";
import { readPage } from "@/lib/search-params";
import type { SemesterEnrollment } from "@/types/entities";
import { ENROLLMENT_STATUSES } from "@/types/enums";

export const metadata: Metadata = { title: "Enrollments" };

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  ENROLLED: "Enrolled",
  CANCELLED: "Cancelled",
};

export default async function AdminEnrollmentsPage({
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
  const status = read("status");
  const semesterId = read("semesterId");
  const page = readPage(params.page);

  const [enrollments, semesters] = await Promise.all([
    listAllRegistrations({ status, semesterId, page, limit: 10 }),
    listSemesters(),
  ]);

  const semesterOptions = semesters.map((semester) => ({
    value: semester.id,
    label: `${semester.name} ${semester.year}`,
  }));

  const columns: DataTableColumn<SemesterEnrollment>[] = [
    {
      id: "student",
      header: "Student",
      cell: (enrollment) => (
        <div className="space-y-0.5">
          <p className="font-medium">
            {enrollment.student?.user.name ?? "Student"}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {enrollment.student?.studentId ?? enrollment.studentId}
          </p>
        </div>
      ),
    },
    {
      id: "semester",
      header: "Semester",
      cell: (enrollment) => (
        <span className="text-sm">
          {enrollment.semester
            ? `${enrollment.semester.name} ${enrollment.semester.year}`
            : "-"}
        </span>
      ),
    },
    {
      id: "credits",
      header: "Credits / fee",
      cell: (enrollment) => (
        <div className="space-y-0.5">
          <p className="font-mono">{enrollment.totalCredits} credits</p>
          <p className="font-mono text-xs text-muted-foreground">
            {enrollment.totalFee.toLocaleString()}
          </p>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (enrollment) => <StatusBadge status={enrollment.status} />,
    },
    {
      id: "payment",
      header: "Payment",
      cell: (enrollment) => <StatusBadge status={enrollment.payment?.status} />,
    },
    {
      id: "registered",
      header: "Registered",
      cell: (enrollment) => (
        <span className="font-mono text-xs">
          {formatDate(enrollment.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      headClassName: "text-right",
      cellClassName: "text-right",
      header: <span className="sr-only">Actions</span>,
      cell: (enrollment) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <OverrideRegistrationDialog enrollment={enrollment} />
          {enrollment.status === "ENROLLED" ? (
            <CancelEnrollmentButton
              enrollmentId={enrollment.id}
              studentName={enrollment.student?.user.name ?? "this student"}
              semesterLabel={
                enrollment.semester
                  ? `${enrollment.semester.name} ${enrollment.semester.year}`
                  : "this semester"
              }
              paymentStatus={enrollment.payment?.status}
            />
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enrollments"
        description="Semester enrollments across students. Override individual course registration statuses or cancel a whole enrollment with an automatic refund."
      />

      <StatCard
        label="Semester enrollments"
        value={enrollments.meta.total}
        hint={`Page ${enrollments.meta.page} of ${Math.max(enrollments.meta.totalPages, 1)}`}
        icon={ClipboardList}
        tone="primary"
        className="sm:max-w-xs"
      />

      <div className="flex flex-wrap items-center gap-2">
        <TableFilter
          paramKey="status"
          label="Filter by enrollment status"
          allLabel="All statuses"
          options={ENROLLMENT_STATUSES.map((value) => ({
            value,
            label: STATUS_LABELS[value],
          }))}
        />
        <TableFilter
          paramKey="semesterId"
          label="Filter by semester"
          allLabel="All semesters"
          options={semesterOptions}
        />
      </div>

      {enrollments.data.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No enrollments found"
          description="No enrollments match these filters yet."
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={enrollments.data}
            getRowKey={(enrollment) => enrollment.id}
          />
          <TablePagination
            page={enrollments.meta.page}
            totalPages={enrollments.meta.totalPages}
            total={enrollments.meta.total}
          />
        </>
      )}
    </div>
  );
}
