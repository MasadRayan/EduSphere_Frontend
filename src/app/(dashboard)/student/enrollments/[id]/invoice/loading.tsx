import { EnrollmentInvoiceSkeleton } from "@/components/student/enrollment-invoice";
import { Skeleton } from "@/components/ui/skeleton";

export default function InvoiceLoading() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="mx-auto w-full max-w-2xl">
        <EnrollmentInvoiceSkeleton />
      </div>
    </div>
  );
}
