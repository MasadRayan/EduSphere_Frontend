import { Receipt, Wallet } from "lucide-react";
import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableFilter } from "@/components/shared/table-filter";
import { TablePagination } from "@/components/shared/table-pagination";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/roles";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getMyPayments } from "@/lib/student/service";
import { firstParam, readPage } from "@/lib/search-params";
import {
  PAYMENT_PURPOSES,
  PAYMENT_STATUSES,
  type PaymentPurpose,
} from "@/types/enums";
import type { Payment } from "@/types/entities";

const PAGE_SIZE = 10;

const PURPOSE_LABELS: Record<PaymentPurpose, string> = {
  TUITION: "Tuition",
  EXAM_FEE: "Exam fee",
  REGISTRATION_FEE: "Registration fee",
  OTHER: "Other",
};

export default async function StudentPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole("STUDENT");
  const params = await searchParams;
  const status = firstParam(params.status);
  const purpose = firstParam(params.purpose);
  const page = readPage(params.page);

  const payments = await getMyPayments({ status, purpose, page, limit: PAGE_SIZE });

  const columns: DataTableColumn<Payment>[] = [
    {
      id: "date",
      header: "Date",
      cell: (payment) => (
        <span className="text-muted-foreground">
          {formatDateTime(payment.createdAt)}
        </span>
      ),
    },
    {
      id: "invoice",
      header: "Invoice",
      cell: (payment) => (
        <span className="font-mono text-xs">
          {payment.merchantInvoiceNumber ?? "-"}
        </span>
      ),
    },
    {
      id: "purpose",
      header: "Purpose",
      cell: (payment) => PURPOSE_LABELS[payment.purpose] ?? payment.purpose,
    },
    {
      id: "amount",
      header: "Amount",
      cell: (payment) => (
        <span className="font-mono">{formatCurrency(payment.amount)}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (payment) => <StatusBadge status={payment.status} />,
    },
    {
      id: "trx",
      header: "Transaction",
      cell: (payment) => (
        <span className="font-mono text-xs text-muted-foreground">
          {payment.bkashTrxId ?? payment.refundTrxId ?? "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Your bKash transactions, refunds and their current status."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Total paid"
          value={formatCurrency(payments.meta.summary.revenue)}
          icon={Wallet}
          tone="primary"
        />
        <StatCard
          label="Total refunded"
          value={formatCurrency(payments.meta.summary.refunded)}
          icon={Receipt}
        />
      </div>

      <div className="flex flex-wrap gap-2">
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
          paramKey="status"
          label="Filter by status"
          allLabel="All statuses"
          options={PAYMENT_STATUSES.map((value) => ({
            value,
            label: value.charAt(0) + value.slice(1).toLowerCase(),
          }))}
        />
      </div>

      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={payments.data}
          getRowKey={(payment) => payment.id}
          empty={
            <EmptyState
              icon={Receipt}
              title="No payments yet"
              description="Payments for tuition and other fees appear here once you start an enrollment."
              action={
                <Button asChild>
                  <Link href="/student/enroll">Enroll in courses</Link>
                </Button>
              }
            />
          }
        />
        <TablePagination
          page={payments.meta.page}
          totalPages={payments.meta.totalPages}
          total={payments.meta.total}
        />
      </div>
    </div>
  );
}
