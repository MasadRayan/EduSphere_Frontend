"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { overrideRegistrationStatusAction } from "@/lib/admin/actions";
import type { CourseRegistration, SemesterEnrollment } from "@/types/entities";

const STATUS_LABELS: Record<string, string> = {
  ENROLLED: "Enrolled",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function OverrideRow({ registration }: { registration: CourseRegistration }) {
  const router = useRouter();
  const [status, setStatus] = useState<string>(registration.status);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("registrationId", registration.id);
      formData.set("status", status);
      const result = await overrideRegistrationStatusAction(
        undefined,
        formData,
      );
      if (result.ok) {
        toast.success(result.message);
        router.refresh();
        return;
      }
      toast.error(result.message);
    });
  };

  const noChange = status === registration.status;

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {registration.courseSection?.course?.code ?? "Course"} -{" "}
          {registration.courseSection?.sectionCode ?? "-"}
        </p>
        <p className="text-xs text-muted-foreground">
          {registration.courseSection?.course?.title ?? ""}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger
            aria-label={`Override status for ${
              registration.courseSection?.course?.code ?? "course"
            }`}
            className="w-36"
            size="sm"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["ENROLLED", "COMPLETED", "CANCELLED"] as const).map((option) => (
              <SelectItem key={option} value={option}>
                {STATUS_LABELS[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          size="sm"
          onClick={submit}
          disabled={pending || noChange}
        >
          {pending ? "Saving..." : "Override"}
        </Button>
      </div>
    </li>
  );
}

export function OverrideRegistrationDialog({
  enrollment,
}: {
  enrollment: SemesterEnrollment;
}) {
  const registrations = enrollment.registrations ?? [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={registrations.length === 0}
          title={
            registrations.length === 0
              ? "No course registrations in this enrollment"
              : undefined
          }
        >
          Override status
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Override registration status</DialogTitle>
          <DialogDescription>
            Overrides apply per course registration. Cancelling with a paid
            semester fee is handled by the cancel action on the row.
          </DialogDescription>
        </DialogHeader>
        <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
          {registrations.map((registration) => (
            <OverrideRow key={registration.id} registration={registration} />
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
