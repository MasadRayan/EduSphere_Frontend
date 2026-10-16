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
import { Input } from "@/components/ui/input";
import { updateResultAction } from "@/lib/instructor/actions";

export function EditResultDialog({
  resultId,
  studentName,
  totalMarks,
  currentMarks,
}: {
  resultId: string;
  studentName: string;
  totalMarks: number;
  currentMarks: number | null;
}) {
  const [open, setOpen] = useState(false);

  const [state, formAction] = useActionState(
    async (
      prev: Parameters<typeof updateResultAction>[0],
      formData: FormData,
    ) => {
      const result = await updateResultAction(prev, formData);
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
        <Button type="button" variant="ghost" size="sm">
          {currentMarks === null ? "Add" : "Edit mark"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{studentName}</DialogTitle>
          <DialogDescription>
            Marks are out of {totalMarks}. Grades are recalculated after saving.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-5">
          <FormError message={state && !state.ok ? state.message : undefined} />
          <input type="hidden" name="resultId" value={resultId} />
          <FormField
            label="Marks obtained"
            htmlFor={`marks-${resultId}`}
            required
            error={
              state && !state.ok
                ? state.fieldErrors?.marksObtained?.[0]
                : undefined
            }
          >
            <Input
              id={`marks-${resultId}`}
              name="marksObtained"
              type="number"
              inputMode="numeric"
              min={0}
              max={totalMarks}
              step={1}
              required
              defaultValue={currentMarks ?? ""}
            />
          </FormField>
          <DialogFooter>
            <SubmitButton className="w-full sm:w-auto" pendingLabel="Saving...">
              Update result
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
