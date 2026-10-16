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
import type { InstructorAdminRow } from "@/types/entities";
import type { SelectOption } from "./approve-student-dialog";

export function InstructorEditDialog({
  instructor,
  departmentOptions,
  action,
}: {
  instructor: InstructorAdminRow;
  departmentOptions: SelectOption[];
  action: (
    prev: ActionResult<null> | undefined,
    formData: FormData,
  ) => Promise<ActionResult<null>>;
}) {
  const [open, setOpen] = useState(false);
  const [departmentId, setDepartmentId] = useState(
    instructor.departmentId ?? "",
  );

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
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit instructor</DialogTitle>
          <DialogDescription>
            Update the profile details or move {instructor.fullName} to another
            department.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-5">
          <FormError message={state && !state.ok ? state.message : undefined} />
          <input type="hidden" name="instructorId" value={instructor.id} />
          <input type="hidden" name="departmentId" value={departmentId} />

          <FormField
            label="Full name"
            htmlFor={`fullName-${instructor.id}`}
            required
            error={fieldErrors?.fullName?.[0]}
          >
            <Input
              id={`fullName-${instructor.id}`}
              name="fullName"
              required
              minLength={3}
              maxLength={60}
              defaultValue={instructor.fullName}
            />
          </FormField>

          <FormField
            label="Phone"
            htmlFor={`phone-${instructor.id}`}
            error={fieldErrors?.phone?.[0]}
          >
            <Input
              id={`phone-${instructor.id}`}
              name="phone"
              type="tel"
              maxLength={30}
              defaultValue={instructor.phone ?? ""}
            />
          </FormField>

          <FormField
            label="Designation"
            htmlFor={`designation-${instructor.id}`}
            error={fieldErrors?.designation?.[0]}
          >
            <Input
              id={`designation-${instructor.id}`}
              name="designation"
              maxLength={80}
              defaultValue={instructor.designation ?? ""}
            />
          </FormField>

          <FormField
            label="Department"
            htmlFor={`dept-${instructor.id}`}
            hint="Select a department to move the instructor."
            error={fieldErrors?.departmentId?.[0]}
          >
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger id={`dept-${instructor.id}`} className="w-full">
                <SelectValue placeholder="No department" />
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
              Save changes
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
