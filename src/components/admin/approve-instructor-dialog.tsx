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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult } from "@/types/api";
import type { SelectOption } from "./approve-student-dialog";

export function ApproveInstructorDialog({
  applicationId,
  applicantName,
  suggestedDesignation,
  departmentOptions,
  action,
}: {
  applicationId: string;
  applicantName: string;
  suggestedDesignation?: string | null;
  departmentOptions: SelectOption[];
  action: (
    prev: ActionResult<null> | undefined,
    formData: FormData,
  ) => Promise<ActionResult<null>>;
}) {
  const [open, setOpen] = useState(false);
  const [departmentId, setDepartmentId] = useState("");

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

  const fieldErrors: Record<string, string[]> | undefined =
    state && !state.ok ? state.fieldErrors : undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Approve</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Approve {applicantName}&apos;s application?</DialogTitle>
          <DialogDescription>
            This creates the instructor profile. The values below are optional
            overrides; the application details are used otherwise.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-5">
          <FormError message={state && !state.ok ? state.message : undefined} />
          <input type="hidden" name="applicationId" value={applicationId} />
          <input type="hidden" name="departmentId" value={departmentId} />

          <FormField
            label="Designation"
            htmlFor={`designation-${applicationId}`}
            hint="Overrides the designation from the application."
            error={fieldErrors?.designation?.[0]}
          >
            <Input
              id={`designation-${applicationId}`}
              name="designation"
              maxLength={80}
              defaultValue={suggestedDesignation ?? ""}
              placeholder="e.g. Assistant Professor"
            />
          </FormField>

          <FormField
            label="Department"
            htmlFor={`dept-${applicationId}`}
            hint="Overrides the department from the application."
            error={fieldErrors?.departmentId?.[0]}
          >
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger id={`dept-${applicationId}`} className="w-full">
                <SelectValue placeholder="From application" />
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {departmentId ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs"
                onClick={() => setDepartmentId("")}
              >
                Use application department
              </Button>
            ) : null}
          </FormField>

          <FormField
            label="Review note"
            htmlFor={`instructor-note-${applicationId}`}
            error={fieldErrors?.reviewNote?.[0]}
          >
            <Textarea
              id={`instructor-note-${applicationId}`}
              name="reviewNote"
              rows={3}
              maxLength={500}
              placeholder="Optional note for the instructor"
            />
          </FormField>

          <DialogFooter>
            <SubmitButton
              className="w-full sm:w-auto"
              pendingLabel="Approving..."
            >
              Approve application
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
