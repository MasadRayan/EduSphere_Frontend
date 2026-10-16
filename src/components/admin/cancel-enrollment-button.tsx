"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { cancelEnrollmentAdminAction } from "@/lib/admin/actions";

export function CancelEnrollmentButton({
  enrollmentId,
  studentName,
  semesterLabel,
  paymentStatus,
}: {
  enrollmentId: string;
  studentName: string;
  semesterLabel: string;
  paymentStatus?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const onConfirm = () => {
    startTransition(async () => {
      const result = await cancelEnrollmentAdminAction(enrollmentId);
      if (result.ok) {
        toast.success(result.message);
        setOpen(false);
        router.refresh();
        return;
      }
      toast.error(result.message);
    });
  };

  const refundNote =
    paymentStatus === "SUCCEEDED"
      ? " A successful payment is refunded automatically."
      : "";

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Cancel enrollment
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Cancel ${studentName}'s enrollment?`}
        description={`All course registrations in ${semesterLabel} are cancelled.${refundNote}`}
        confirmLabel="Cancel enrollment"
        cancelLabel="Keep enrollment"
        destructive
        pending={pending}
        onConfirm={onConfirm}
      />
    </>
  );
}
