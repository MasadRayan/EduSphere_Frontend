import { Receipt } from "lucide-react";
import type { Metadata } from "next";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
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
import { listAllPayments } from "@/lib/admin/service";
import { requireRole } from "@/lib/auth/roles";
import { listSemesters } from "@/lib/catalog/service";
import { formatDate } from "@/lib/format";
import { readPage } from "@/lib/search-params";
import type { Payment } from "@/types/entities";
import { PAYMENT_PURPOSES, PAYMENT_STATUSES } from "@/types/enums";

export const metadata: Metadata = { title: "Payments" };

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  SUCCEEDED: "Succeeded",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

const PURPOSE_LABELS: Record<string, string> = {
  TUITION: "Tuition",
  EXAM_FEE: "Exam fee",
  REGISTRATION_FEE: "Registration fee",
  OTHER: "Other",
};

export default async function AdminPaymentsPage({
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
  const purpose = read("purpose");
  const semesterId = read("semesterId");
  const startDate = read("startDate");
  const endDate = read("endDate");
  const page = readPage(params.page);

  const [payments, semesters] = await Promise.all([
    listAllPayments({
      status,
      purpose,
      semesterId,
      startDate,
      endDate,
      page,
      limit: 10,
    }),
    listSemesters(),
  ]);

  const columns: DataTableColumn<Payment>[] = [
    {
      id: "payer",
      header: "Payer",
      cell: (payment) => (
        <div className="space-y-0.5">
          <p className="font-medium">{payment.user?.name ?? "User"}</p>
          <p className="truncate text-xs text-muted-foreground">
            {payment.user?.email ?? payment.userId}
          </p>
        </div>
      ),
    },
    {
      id: "purpose",
      header: "Purpose",
      cell: (payment) => (
        <span className="text-sm">
          {PURPOSE_LABELS[payment.purpose] ?? payment.purpose}
        </span>
      ),
    },
    {
      id: "amount",
      header: "Amount",
      cell: (payment) => (
        <span className="font-mono">
          {payment.amount.toLocaleString()} {payment.currency}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (payment) => <StatusBadge status={payment.status} />,
    },
    {
      id: "transaction",
      header: "Transaction",
      cell: (payment) => (
        <div className="space-y-0.5 font-mono text-xs text-muted-foreground">
          {payment.bkashTrxId ? <p>{payment.bkashTrxId}</p> : null}
          {payment.refundTrxId ? <p>Refund {payment.refundTrxId}</p> : null}
          {!payment.bkashTrxId && !payment.refundTrxId ? <p>-</p> : null}
        </div>
      ),
    },
    {
      id: "date",
      header: "Date",
      cell: (payment) => (
        <span className="font-mono text-xs">
          {formatDate(payment.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Every bKash transaction, filterable by status, purpose, semester and date range."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Revenue"
          value={payments.meta.summary.revenue.toLocaleString()}
          icon={Receipt}
          tone="success"
        />
        <StatCard
          label="Refunded"
          value={payments.meta.summary.refunded.toLocaleString()}
          icon={Receipt}
          tone="warning"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <TableFilter
          paramKey="status"
          label="Filter by status"
          allLabel="All statuses"
          options={PAYMENT_STATUSES.map((value) => ({
            value,
            label: STATUS_LABELS[value],
          }))}
        />
        <TableFilter
          paramKey="purpose"
          label="Filter by purpose"
          allLabel="All purposes"
          options={PAYMENT_PURPOSES.map((value) => ({
            value,
            label: PURPOSE_LABELS[value],
          }))}
        />
        <TableFilter
          paramKey="semesterId"
          label="Filter by semester"
          allLabel="All semesters"
          options={semesters.map((semester) => ({
            value: semester.id,
            label: `${semester.name} ${semester.year}`,
          }))}
        />
        <DateRangeFilter />
      </div>

      {payments.data.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No payments found"
          description="No payments match these filters yet."
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={payments.data}
            getRowKey={(payment) => payment.id}
          />
          <TablePagination
            page={payments.meta.page}
            totalPages={payments.meta.totalPages}
            total={payments.meta.total}
          />
        </>
      )}
    </div>
  );
}
