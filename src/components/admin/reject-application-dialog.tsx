"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
import { FormError } from "@/components/auth/form-error";
import { FormField } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult } from "@/types/api";

export function RejectApplicationDialog({
  applicationId,
  applicantName,
  action,
}: {
  applicationId: string;
  applicantName: string;
  action: (
    prev: ActionResult<null> | undefined,
    formData: FormData,
  ) => Promise<ActionResult<null>>;
}) {
  const [open, setOpen] = useState(false);

  const [state, formAction] = useActionState(
    async (prev: ActionResult<null> | undefined, formData: FormData) => {
      const result = await action(prev, formData);
      if (result.ok) {
        toast.success(result.message);
        setOpen(false);
      }
      return result;
    },
    undefined,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Reject
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject {applicantName}&apos;s application?</DialogTitle>
          <DialogDescription>
            The applicant keeps their account but cannot enroll. You can add a
            note the applicant will see.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-5">
          <FormError message={state && !state.ok ? state.message : undefined} />
          <input type="hidden" name="applicationId" value={applicationId} />
          <FormField
            label="Review note"
            htmlFor={`reject-note-${applicationId}`}
            hint="Optional, shown to the applicant."
            error={
              state && !state.ok
                ? state.fieldErrors?.reviewNote?.[0]
                : undefined
            }
          >
            <Textarea
              id={`reject-note-${applicationId}`}
              name="reviewNote"
              rows={4}
              maxLength={500}
              placeholder="Why is this application rejected?"
            />
          </FormField>
          <DialogFooter>
            <SubmitButton
              className="w-full sm:w-auto"
              pendingLabel="Rejecting..."
            >
              Reject application
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
