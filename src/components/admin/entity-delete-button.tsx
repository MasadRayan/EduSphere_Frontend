"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/types/api";

export function EntityDeleteButton({
  action,
  entityId,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  buttonLabel = "Delete",
  blockLabel,
}: {
  action: (id: string) => Promise<ActionResult<null>>;
  entityId: string;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  buttonLabel?: string;
  blockLabel?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const onConfirm = () => {
    startTransition(async () => {
      const result = await action(entityId);
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
        disabled={blockLabel !== undefined}
        title={blockLabel}
        onClick={() => setOpen(true)}
      >
        {blockLabel ?? buttonLabel}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        destructive
        pending={pending}
        onConfirm={onConfirm}
      />
    </>
  );
}
