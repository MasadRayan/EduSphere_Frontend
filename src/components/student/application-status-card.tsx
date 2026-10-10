import { StatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDate } from "@/lib/format";
import type { StudentApplication } from "@/types/entities";

export function ApplicationStatusCard({
  application,
}: {
  application: StudentApplication;
}) {
  if (application.status === "PENDING") {
    return (
      <Alert>
        <AlertTitle className="flex items-center gap-2">
          Application under review
          <StatusBadge status="PENDING" />
        </AlertTitle>
        <AlertDescription>
          Submitted {formatDate(application.createdAt)}. You can update your
          details below and resubmit while we review it.
        </AlertDescription>
      </Alert>
    );
  }

  if (application.status === "REJECTED") {
    return (
      <Alert variant="destructive">
        <AlertTitle className="flex items-center gap-2">
          Application not approved
          <StatusBadge status="REJECTED" />
        </AlertTitle>
        <AlertDescription>
          {application.reviewNote
            ? `Reviewer note: ${application.reviewNote}`
            : "Update your details below and resubmit your application."}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
