import { Receipt } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { EnrollmentInvoice } from "@/components/student/enrollment-invoice";
import { InvoiceDownloadButton } from "@/components/student/invoice-download-button";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/errors";
import { requireStudentProfile } from "@/lib/auth/roles";
import { getMyEnrollment } from "@/lib/student/service";
import type { SemesterEnrollment } from "@/types/entities";

export const metadata: Metadata = { title: "Invoice" };

const INVOICE_READY_STATUSES = ["SUCCEEDED", "REFUNDED"];

export default async function StudentInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStudentProfile();
  const { id } = await params;

  let enrollment: SemesterEnrollment | null = null;
  let loadFailed = false;

  try {
    enrollment = await getMyEnrollment(id);
  } catch (error) {
    // A tampered or foreign id must not reveal another student's enrollment.
    if (error instanceof ApiError && [403, 404].includes(error.status)) {
      notFound();
    }
    loadFailed = true;
  }

  if (loadFailed) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Invoice"
          description="The registration invoice for this enrollment."
        />
        <EmptyState
          icon={Receipt}
          title="We could not load this invoice"
          description="The server did not respond. Please try again in a moment."
          action={
            <Button asChild variant="outline">
              <Link href="/student/enrollments">Back to my enrollments</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const payment = enrollment?.payment ?? null;
  const invoiceReady =
    payment !== null && INVOICE_READY_STATUSES.includes(payment.status);

  if (!enrollment || !payment || !invoiceReady) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Invoice"
          description="The registration invoice for this enrollment."
        />
        <EmptyState
          icon={Receipt}
          title="No invoice available"
          description="An invoice is created after a successful bKash payment. This enrollment has no settled payment."
          action={
            <Button asChild variant="outline">
              <Link href="/student/enrollments">Back to my enrollments</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const semester = enrollment.semester;
  const invoiceNumber = payment.merchantInvoiceNumber ?? payment.id;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoice"
        description={`Invoice ${invoiceNumber}${
          semester ? ` for ${semester.name} ${semester.year}` : ""
        }.`}
        actions={
          <Button asChild variant="outline">
            <Link href="/student/enrollments">Back to my enrollments</Link>
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-2xl">
        <EnrollmentInvoice
          enrollment={enrollment}
          actions={
            <InvoiceDownloadButton
              enrollmentId={enrollment.id}
              invoiceNumber={payment.merchantInvoiceNumber}
            />
          }
        />
      </div>
    </div>
  );
}
