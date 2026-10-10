import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusTone = "warning" | "success" | "danger" | "info" | "neutral";

interface StatusStyle {
  label: string;
  tone: StatusTone;
}

const STATUS_STYLES: Record<string, StatusStyle> = {
  PENDING: { label: "Pending", tone: "warning" },
  SUCCEEDED: { label: "Succeeded", tone: "success" },
  PAID: { label: "Paid", tone: "success" },
  APPROVED: { label: "Approved", tone: "success" },
  ENROLLED: { label: "Enrolled", tone: "success" },
  ACTIVE: { label: "Active", tone: "success" },
  PRESENT: { label: "Present", tone: "success" },
  REFUNDED: { label: "Refunded", tone: "info" },
  COMPLETED: { label: "Completed", tone: "info" },
  LATE: { label: "Late", tone: "warning" },
  PROCESSING: { label: "Processing", tone: "warning" },
  REJECTED: { label: "Rejected", tone: "danger" },
  BLOCKED: { label: "Blocked", tone: "danger" },
  DELETED: { label: "Deleted", tone: "danger" },
  FAILED: { label: "Failed", tone: "danger" },
  CANCELLED: { label: "Cancelled", tone: "danger" },
  ABSENT: { label: "Absent", tone: "danger" },
};

const TONE_STYLES: Record<StatusTone, { container: string; dot: string }> = {
  warning: {
    container: "border-warning/50 bg-warning/15",
    dot: "bg-warning",
  },
  success: {
    container: "border-success/50 bg-success/15",
    dot: "bg-success",
  },
  danger: {
    container: "border-destructive/50 bg-destructive/15",
    dot: "bg-destructive",
  },
  info: {
    container: "border-info/50 bg-info/15",
    dot: "bg-info",
  },
  neutral: {
    container: "border-border bg-muted",
    dot: "bg-muted-foreground",
  },
};

function humanize(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function StatusBadge({
  status,
  className,
}: {
  status: string | null | undefined;
  className?: string;
}) {
  if (!status) {
    return <span className="text-muted-foreground">-</span>;
  }

  const style = STATUS_STYLES[status] ?? {
    label: humanize(status),
    tone: "neutral" as const,
  };
  const tone = TONE_STYLES[style.tone];

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 text-foreground", tone.container, className)}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", tone.dot)}
      />
      {style.label}
    </Badge>
  );
}
