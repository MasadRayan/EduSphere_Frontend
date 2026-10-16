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
import type { ActionResult } from "@/types/api";
import type { Department } from "@/types/entities";

export function DepartmentFormDialog({
  department,
  action,
}: {
  department?: Department;
  action: (
    prev: ActionResult<null> | undefined,
    formData: FormData,
  ) => Promise<ActionResult<null>>;
}) {
  const isEdit = !!department;
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

  const fieldErrors: Record<string, string[]> | undefined =
    state && !state.ok ? state.fieldErrors : undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={isEdit ? "outline" : "default"} size="sm">
          {isEdit ? "Edit" : "New department"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit department" : "New department"}
          </DialogTitle>
          <DialogDescription>
            Departments group programs, courses and instructors.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-5">
          <FormError message={state && !state.ok ? state.message : undefined} />
          <input type="hidden" name="mode" value={isEdit ? "edit" : "create"} />
          <input
            type="hidden"
            name="departmentId"
            value={department?.id ?? ""}
          />

          <FormField
            label="Name"
            htmlFor="department-name"
            required
            error={fieldErrors?.name?.[0]}
          >
            <Input
              id="department-name"
              name="name"
              required
              minLength={2}
              maxLength={100}
              defaultValue={department?.name ?? ""}
              placeholder="e.g. Computer Science"
            />
          </FormField>

          <FormField
            label="Code"
            htmlFor="department-code"
            required
            hint="Short tag shown on courses, e.g. CSE."
            error={fieldErrors?.code?.[0]}
          >
            <Input
              id="department-code"
              name="code"
              required
              minLength={2}
              maxLength={20}
              defaultValue={department?.code ?? ""}
              placeholder="CSE"
              className="font-mono uppercase"
            />
          </FormField>

          <DialogFooter>
            <SubmitButton className="w-full sm:w-auto" pendingLabel="Saving...">
              {isEdit ? "Save changes" : "Create department"}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
