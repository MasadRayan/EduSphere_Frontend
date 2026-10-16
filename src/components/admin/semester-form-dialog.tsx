"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
import { FormError } from "@/components/auth/form-error";
import { FormField } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { ActionResult } from "@/types/api";
import type { AdminSemester } from "@/types/entities";

function toDateInput(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  return value.slice(0, 10);
}

export function SemesterFormDialog({
  semester,
  action,
}: {
  semester?: AdminSemester;
  action: (
    prev: ActionResult<null> | undefined,
    formData: FormData,
  ) => Promise<ActionResult<null>>;
}) {
  const isEdit = !!semester;
  const [open, setOpen] = useState(false);
  const [isActive, setIsActive] = useState(semester?.isActive ?? false);

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
        <Button variant={isEdit ? "outline" : "default"} size="sm">
          {isEdit ? "Edit" : "New semester"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit semester" : "New semester"}</DialogTitle>
          <DialogDescription>
            At most one semester can be active at a time; making this one active
            deactivates the others.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-5">
          <FormError message={state && !state.ok ? state.message : undefined} />
          <input type="hidden" name="mode" value={isEdit ? "edit" : "create"} />
          <input type="hidden" name="semesterId" value={semester?.id ?? ""} />
          <input
            type="hidden"
            name="isActive"
            value={isActive ? "true" : "false"}
          />

          <div className="grid gap-5 sm:grid-cols-3">
            <FormField
              label="Name"
              htmlFor="semester-name"
              required
              error={fieldErrors?.name?.[0]}
            >
              <Input
                id="semester-name"
                name="name"
                required
                minLength={2}
                maxLength={50}
                defaultValue={semester?.name ?? ""}
                placeholder="Fall"
              />
            </FormField>

            <FormField
              label="Year"
              htmlFor="semester-year"
              required
              error={fieldErrors?.year?.[0]}
            >
              <Input
                id="semester-year"
                name="year"
                type="number"
                inputMode="numeric"
                min={2000}
                max={2100}
                step={1}
                required
                defaultValue={semester?.year ?? new Date().getFullYear()}
              />
            </FormField>

            <div className="flex items-end pb-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="semester-active"
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(checked === true)}
                />
                <label
                  htmlFor="semester-active"
                  className="cursor-pointer text-sm"
                >
                  Active
                </label>
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Start date"
              htmlFor="semester-start"
              required
              error={fieldErrors?.startDate?.[0]}
            >
              <Input
                id="semester-start"
                name="startDate"
                type="date"
                required
                defaultValue={toDateInput(semester?.startDate)}
              />
            </FormField>

            <FormField
              label="End date"
              htmlFor="semester-end"
              required
              error={fieldErrors?.endDate?.[0]}
            >
              <Input
                id="semester-end"
                name="endDate"
                type="date"
                required
                defaultValue={toDateInput(semester?.endDate)}
              />
            </FormField>
          </div>

          <FormField
            label="Registration deadline"
            htmlFor="semester-deadline"
            hint="Optional. Leave empty when creating; when editing, an empty field keeps the current value."
            error={fieldErrors?.registrationDeadline?.[0]}
          >
            <Input
              id="semester-deadline"
              name="registrationDeadline"
              type="date"
              defaultValue={toDateInput(semester?.registrationDeadline)}
            />
          </FormField>

          <DialogFooter>
            <SubmitButton className="w-full sm:w-auto" pendingLabel="Saving...">
              {isEdit ? "Save changes" : "Create semester"}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
