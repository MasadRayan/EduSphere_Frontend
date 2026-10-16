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
import type { ActionResult } from "@/types/api";
import type { Program } from "@/types/entities";
import type { SelectOption } from "./approve-student-dialog";

export function ProgramFormDialog({
  program,
  departmentOptions,
  action,
}: {
  program?: Program;
  departmentOptions: SelectOption[];
  action: (
    prev: ActionResult<null> | undefined,
    formData: FormData,
  ) => Promise<ActionResult<null>>;
}) {
  const isEdit = !!program;
  const [open, setOpen] = useState(false);
  const [departmentId, setDepartmentId] = useState(program?.departmentId ?? "");

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
        <Button
          variant={isEdit ? "outline" : "default"}
          size="sm"
          disabled={departmentOptions.length === 0}
          title={
            departmentOptions.length === 0
              ? "Create a department first"
              : undefined
          }
        >
          {isEdit ? "Edit" : "New program"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit program" : "New program"}</DialogTitle>
          <DialogDescription>
            Programs are the degrees students apply to.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-5">
          <FormError message={state && !state.ok ? state.message : undefined} />
          <input type="hidden" name="mode" value={isEdit ? "edit" : "create"} />
          <input type="hidden" name="programId" value={program?.id ?? ""} />
          <input type="hidden" name="departmentId" value={departmentId} />

          <FormField
            label="Name"
            htmlFor="program-name"
            required
            error={fieldErrors?.name?.[0]}
          >
            <Input
              id="program-name"
              name="name"
              required
              minLength={2}
              maxLength={100}
              defaultValue={program?.name ?? ""}
              placeholder="e.g. BSc in Computer Science"
            />
          </FormField>

          <FormField
            label="Degree type"
            htmlFor="program-degreeType"
            required
            hint="For example BSc, MSc or PhD."
            error={fieldErrors?.degreeType?.[0]}
          >
            <Input
              id="program-degreeType"
              name="degreeType"
              required
              minLength={2}
              maxLength={50}
              defaultValue={program?.degreeType ?? ""}
              placeholder="BSc"
            />
          </FormField>

          <FormField
            label="Total credits"
            htmlFor="program-credits"
            required
            error={fieldErrors?.totalCredits?.[0]}
          >
            <Input
              id="program-credits"
              name="totalCredits"
              type="number"
              inputMode="numeric"
              min={1}
              max={500}
              step={1}
              required
              defaultValue={program?.totalCredits ?? ""}
            />
          </FormField>

          <FormField
            label="Department"
            htmlFor="program-department"
            required
            error={fieldErrors?.departmentId?.[0]}
          >
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger id="program-department" className="w-full">
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <DialogFooter>
            <SubmitButton className="w-full sm:w-auto" pendingLabel="Saving...">
              {isEdit ? "Save changes" : "Create program"}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
