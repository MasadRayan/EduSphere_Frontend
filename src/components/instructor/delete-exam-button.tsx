"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { deleteExamAction } from "@/lib/instructor/actions";

export function DeleteExamButton({
  examId,
  examLabel,
}: {
  examId: string;
  examLabel: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const onConfirm = () => {
    startTransition(async () => {
      const result = await deleteExamAction(examId);
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
        Delete exam
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete this exam?"
        description={`This permanently deletes ${examLabel} and all of its recorded results.`}
        confirmLabel="Delete exam"
        cancelLabel="Keep exam"
        destructive
        pending={pending}
        onConfirm={onConfirm}
      />
    </>
  );
}
