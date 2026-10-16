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
import type { StudentSectionAdmin } from "@/types/entities";
import type { SelectOption } from "./approve-student-dialog";

export function StudentSectionFormDialog({
  section,
  programOptions,
  action,
}: {
  section?: StudentSectionAdmin;
  programOptions: SelectOption[];
  action: (
    prev: ActionResult<null> | undefined,
    formData: FormData,
  ) => Promise<ActionResult<null>>;
}) {
  const isEdit = !!section;
  const [open, setOpen] = useState(false);
  const [programId, setProgramId] = useState(section?.programId ?? "");

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

  const defaultYear = new Date().getFullYear();
  const editYear = section?.enrollmentYear ?? defaultYear;

  const fieldErrors: Record<string, string[]> | undefined =
    state && !state.ok ? state.fieldErrors : undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isEdit ? "outline" : "default"}
          size="sm"
          disabled={programOptions.length === 0}
          title={
            programOptions.length === 0 ? "Create a program first" : undefined
          }
        >
          {isEdit ? "Edit" : "New student section"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit student section" : "New student section"}
          </DialogTitle>
          <DialogDescription>
            Student sections group one program&apos;s intake year for advisory
            and approval.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-5">
          <FormError message={state && !state.ok ? state.message : undefined} />
          <input type="hidden" name="mode" value={isEdit ? "edit" : "create"} />
          <input type="hidden" name="sectionId" value={section?.id ?? ""} />
          <input type="hidden" name="programId" value={programId} />

          {isEdit ? null : (
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Program"
                htmlFor="student-section-program"
                required
                error={fieldErrors?.programId?.[0]}
              >
                <Select value={programId} onValueChange={setProgramId}>
                  <SelectTrigger
                    id="student-section-program"
                    className="w-full"
                  >
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                  <SelectContent>
                    {programOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label="Enrollment year"
                htmlFor="student-section-year"
                required
                error={fieldErrors?.enrollmentYear?.[0]}
              >
                <Input
                  id="student-section-year"
                  name="enrollmentYear"
                  type="number"
                  inputMode="numeric"
                  min={2000}
                  max={new Date().getFullYear() + 1}
                  step={1}
                  required
                  defaultValue={isEdit ? editYear : defaultYear}
                />
              </FormField>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Section code"
              htmlFor="student-section-code"
              required
              error={fieldErrors?.sectionCode?.[0]}
            >
              <Input
                id="student-section-code"
                name="sectionCode"
                required
                minLength={1}
                maxLength={10}
                defaultValue={section?.sectionCode ?? ""}
                placeholder="A"
              />
            </FormField>

            <FormField
              label="Capacity"
              htmlFor="student-section-capacity"
              required
              error={fieldErrors?.capacity?.[0]}
            >
              <Input
                id="student-section-capacity"
                name="capacity"
                type="number"
                inputMode="numeric"
                min={1}
                max={1000}
                step={1}
                required
                defaultValue={section?.capacity ?? 40}
              />
            </FormField>
          </div>

          <DialogFooter>
            <SubmitButton className="w-full sm:w-auto" pendingLabel="Saving...">
              {isEdit ? "Save changes" : "Create section"}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
