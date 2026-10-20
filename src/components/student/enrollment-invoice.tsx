import type { ReactNode } from "react";
import { CourseCodeTag } from "@/components/shared/course-code-tag";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SemesterEnrollment } from "@/types/entities";

export interface EnrollmentInvoiceProps {
  enrollment: SemesterEnrollment;
  /** Optional controls rendered on the right of the invoice header. */
  actions?: ReactNode;
  className?: string;
}

/**
 * Receipt view of a semester enrollment. Mirrors the invoice PDF attached to
 * the confirmation email so the student sees the same numbers on screen.
 */
export function EnrollmentInvoice({
  enrollment,
  actions,
  className,
}: EnrollmentInvoiceProps) {
  const payment = enrollment.payment ?? null;
  const student = enrollment.student;
  const semester = enrollment.semester;

  const registrations = [...(enrollment.registrations ?? [])].sort((a, b) =>
    (a.courseSection.course?.code ?? "").localeCompare(
      b.courseSection.course?.code ?? "",
    ),
  );

  const perCreditFee =
    enrollment.totalCredits > 0
      ? enrollment.totalFee / enrollment.totalCredits
      : 0;

  const invoiceNumber =
    payment?.merchantInvoiceNumber ?? payment?.id ?? enrollment.id;
  const paidAt = payment?.updatedAt ?? enrollment.updatedAt;
  const titleId = `invoice-title-${enrollment.id}`;

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        "overflow-hidden rounded-xl border bg-card shadow-sm",
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-4 border-b bg-muted/40 px-5 py-4 sm:px-6">
        <div className="space-y-1">
          <p className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
            EduSphere
          </p>
          <h2 id={titleId} className="font-display text-lg font-semibold">
            Semester registration invoice
          </h2>
          <p className="font-mono text-xs text-muted-foreground">
            {invoiceNumber}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <StatusBadge status={payment?.status} />
          <p className="text-xs text-muted-foreground">
            Paid on {formatDateTime(paidAt)}
          </p>
          {actions ? (
            <div className="flex items-center gap-2 pt-1">{actions}</div>
          ) : null}
        </div>
      </header>

      <div className="space-y-6 px-5 py-5 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Billed to
            </p>
            <p className="font-medium">
              {student?.fullName ?? student?.user.name ?? "-"}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {student?.studentId ?? "-"}
            </p>
            <p className="text-sm break-all text-muted-foreground">
              {student?.user.email ?? "-"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Enrollment
            </p>
            <p className="font-medium">
              {semester ? `${semester.name} ${semester.year}` : "-"}
            </p>
            <p className="text-sm text-muted-foreground">
              {enrollment.totalCredits} credits at{" "}
              {formatCurrency(perCreditFee)} per credit
            </p>
            <p className="text-sm text-muted-foreground">
              Payment method: bKash
            </p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead className="hidden text-center sm:table-cell">
                Credits
              </TableHead>
              <TableHead className="text-right">Fee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.map((registration) => {
              const course = registration.courseSection.course;
              const code = course?.code ?? "Course";
              const title = course?.title ?? "Course details unavailable";
              const creditHours = course?.creditHours ?? 0;

              return (
                <TableRow key={registration.id}>
                  <TableCell className="whitespace-normal">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <CourseCodeTag code={code} credits={creditHours} />
                      <span className="text-sm">{title}</span>
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      Section {registration.courseSection.sectionCode}
                      <span className="sm:hidden">
                        {" "}
                        · {creditHours} credit(s)
                      </span>
                    </p>
                  </TableCell>
                  <TableCell className="hidden text-center font-mono sm:table-cell">
                    {creditHours}
                  </TableCell>
                  <TableCell className="text-right font-mono whitespace-nowrap">
                    {formatCurrency(creditHours * perCreditFee)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <dl className="space-y-2 border-t pt-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Total credits</dt>
            <dd className="font-mono">{enrollment.totalCredits}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Transaction ID</dt>
            <dd className="font-mono break-all">
              {payment?.bkashTrxId ?? "-"}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-t pt-2">
            <dt className="font-display text-base font-semibold">Total paid</dt>
            <dd className="font-display text-xl font-semibold">
              {formatCurrency(payment?.amount ?? enrollment.totalFee)}
            </dd>
          </div>
        </dl>

        <p className="text-xs text-muted-foreground">
          This is an auto-generated invoice for your semester course
          registration. For any queries, contact the registrar office.
        </p>
      </div>
    </article>
  );
}

export function EnrollmentInvoiceSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-xl border bg-card shadow-sm"
    >
      <div className="flex items-start justify-between gap-4 border-b bg-muted/40 px-5 py-4 sm:px-6">
        <div className="space-y-2">
          <div className="h-3 w-20 rounded bg-muted" />
          <div className="h-5 w-56 rounded bg-muted" />
          <div className="h-3 w-32 rounded bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="h-5 w-20 rounded bg-muted" />
          <div className="h-3 w-28 rounded bg-muted" />
        </div>
      </div>
      <div className="space-y-6 px-5 py-5 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="h-3 w-16 rounded bg-muted" />
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="h-3 w-24 rounded bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-20 rounded bg-muted" />
            <div className="h-4 w-36 rounded bg-muted" />
            <div className="h-3 w-44 rounded bg-muted" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
        </div>
        <div className="h-10 w-full rounded bg-muted" />
      </div>
    </div>
  );
}
