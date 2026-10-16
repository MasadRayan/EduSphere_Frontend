import { ClipboardList } from "lucide-react";
import Link from "next/link";
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
import { CancelEnrollmentButton } from "@/components/student/cancel-enrollment-button";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/roles";
import { formatCurrency, formatDate } from "@/lib/format";
import { firstParam, readPage } from "@/lib/search-params";
import { getMyEnrollments, listSemesters } from "@/lib/student/service";
import type { SemesterEnrollment } from "@/types/entities";
import { ENROLLMENT_STATUSES } from "@/types/enums";

const PAGE_SIZE = 10;

function semesterLabel(enrollment: SemesterEnrollment): string {
  const semester = enrollment.semester;
  if (!semester) {
    return "-";
  }
  return `${semester.name} ${semester.year}`;
}

export default async function StudentEnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole("STUDENT");
  const params = await searchParams;
  const status = firstParam(params.status);
  const semesterId = firstParam(params.semesterId);
  const page = readPage(params.page);

  const [enrollments, semesters] = await Promise.all([
    getMyEnrollments({ status, semesterId, page, limit: PAGE_SIZE }),
    listSemesters(),
  ]);

  const columns: DataTableColumn<SemesterEnrollment>[] = [
    {
      id: "semester",
      header: "Semester",
      cell: (enrollment) => (
        <div className="space-y-0.5">
          <p className="font-medium">{semesterLabel(enrollment)}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {enrollment.registrations?.length ?? 0} courses
          </p>
        </div>
      ),
    },
    {
      id: "credits",
      header: "Credits",
      cell: (enrollment) => (
        <span className="font-mono">{enrollment.totalCredits}</span>
      ),
    },
    {
      id: "fee",
      header: "Fee",
      cell: (enrollment) => (
        <span className="font-mono">{formatCurrency(enrollment.totalFee)}</span>
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
      id: "created",
      header: "Created",
      cell: (enrollment) => (
        <span className="text-muted-foreground">
          {formatDate(enrollment.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      headClassName: "text-right",
      cellClassName: "text-right",
      cell: (enrollment) => (
        <div className="flex items-center justify-end gap-2">
          {enrollment.status === "ENROLLED" ? (
            <CancelEnrollmentButton
              enrollmentId={enrollment.id}
              semesterName={semesterLabel(enrollment)}
            />
          ) : null}
          <Button asChild variant="ghost" size="sm">
            <Link href={`/student/courses?semesterId=${enrollment.semesterId}`}>
              View courses
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  const activeCount = enrollments.data.filter(
    (enrollment) => enrollment.status === "ENROLLED",
  ).length;
  const paidTotal = enrollments.data
    .filter((enrollment) => enrollment.payment?.status === "SUCCEEDED")
    .reduce((sum, enrollment) => sum + enrollment.totalFee, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My enrollments"
        description="Every semester enrollment with its courses, fee and payment status."
        actions={
          <Button asChild>
            <Link href="/student/enroll">Enroll in courses</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Enrollments"
          value={enrollments.meta.total}
          icon={ClipboardList}
        />
        <StatCard
          label="Active on this page"
          value={activeCount}
          tone="success"
        />
        <StatCard
          label="Paid on this page"
          value={formatCurrency(paidTotal)}
          tone="primary"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <TableFilter
          paramKey="semesterId"
          label="Filter by semester"
          allLabel="All semesters"
          options={semesters.map((semester) => ({
            value: semester.id,
            label: `${semester.name} ${semester.year}`,
          }))}
        />
        <TableFilter
          paramKey="status"
          label="Filter by status"
          allLabel="All statuses"
          options={ENROLLMENT_STATUSES.map((value) => ({
            value,
            label: value.charAt(0) + value.slice(1).toLowerCase(),
          }))}
        />
      </div>

      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={enrollments.data}
          getRowKey={(enrollment) => enrollment.id}
          empty={
            <EmptyState
              icon={ClipboardList}
              title="No enrollments yet"
              description="Once you enroll in courses for a semester, it shows up here with its payment status."
              action={
                <Button asChild>
                  <Link href="/student/enroll">Enroll in courses</Link>
                </Button>
              }
            />
          }
        />
        <TablePagination
          page={enrollments.meta.page}
          totalPages={enrollments.meta.totalPages}
          total={enrollments.meta.total}
        />
      </div>
    </div>
  );
}
