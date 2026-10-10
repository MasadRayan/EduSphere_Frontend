"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { cancelEnrollmentAction } from "@/lib/student/actions";

export function CancelEnrollmentButton({
  enrollmentId,
  semesterName,
}: {
  enrollmentId: string;
  semesterName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const onConfirm = () => {
    startTransition(async () => {
      const result = await cancelEnrollmentAction(enrollmentId);
      if (result.ok) {
        toast.success(result.message);
        setOpen(false);
        router.refresh();
        return;
      }
      toast.error(result.message);
    });
  };

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
        title="Cancel this enrollment?"
        description={`This cancels your enrollment for ${semesterName}. Refunds are only issued before the semester starts.`}
        confirmLabel="Cancel enrollment"
        cancelLabel="Keep enrollment"
        destructive
        pending={pending}
        onConfirm={onConfirm}
      />
    </>
  );
}
