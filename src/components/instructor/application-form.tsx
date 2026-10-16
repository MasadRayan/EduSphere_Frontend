"use client";

import { useActionState, useState } from "react";
import { FormError } from "@/components/auth/form-error";
import { FormField } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import { applyInstructorAction } from "@/lib/instructor/actions";
import type { Department } from "@/types/entities";

export interface ApplicationDefaults {
  departmentName?: string;
  designation?: string | null;
  phone?: string | null;
  coverNote?: string | null;
}

export function ApplicationForm({
  departments,
  defaults,
  mode,
}: {
  departments: Department[];
  defaults?: ApplicationDefaults;
  mode: "create" | "edit";
}) {
  const [state, formAction] = useActionState(applyInstructorAction, undefined);
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  useActionToast(state);

  const initialDepartment =
    departments.find(
      (department) =>
        department.name === defaults?.departmentName &&
        defaults.departmentName !== undefined,
    )?.id ?? "";

  const [departmentId, setDepartmentId] = useState(initialDepartment);

  const department = departments.find((item) => item.id === departmentId);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormError message={state && !state.ok ? state.message : undefined} />
      <input type="hidden" name="mode" value={mode} />
      <input
        type="hidden"
        name="departmentName"
        value={department?.name ?? defaults?.departmentName ?? ""}
      />

      <FormField
        label="Department"
        htmlFor="department"
        required
        error={fieldErrors?.departmentName?.[0]}
      >
        <Select
          value={departmentId || "__legacy__"}
          onValueChange={setDepartmentId}
        >
          <SelectTrigger id="department" className="w-full">
            <SelectValue placeholder="Select a department" />
          </SelectTrigger>
          <SelectContent>
            {departmentId ? null : (
              <SelectItem value="__legacy__" disabled>
                {defaults?.departmentName ?? "Select a department"}
              </SelectItem>
            )}
            {departments.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField
        label="Designation"
        htmlFor="designation"
        hint="Optional, e.g. Lecturer or Associate Professor."
        error={fieldErrors?.designation?.[0]}
      >
        <Input
          id="designation"
          name="designation"
          maxLength={80}
          defaultValue={defaults?.designation ?? ""}
          aria-invalid={fieldErrors?.designation ? true : undefined}
        />
      </FormField>

      <FormField
        label="Phone"
        htmlFor="phone"
        hint="Optional. We use it only to contact you about your application."
        error={fieldErrors?.phone?.[0]}
      >
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+8801XXXXXXXXX"
          defaultValue={defaults?.phone ?? ""}
          aria-invalid={fieldErrors?.phone ? true : undefined}
        />
      </FormField>

      <div className="space-y-1.5">
        <Label htmlFor="coverNote">
          Cover note
          <span className="sr-only">(optional)</span>
        </Label>
        <Textarea
          id="coverNote"
          name="coverNote"
          rows={4}
          maxLength={500}
          placeholder="A short note for the reviewers."
          defaultValue={defaults?.coverNote ?? ""}
          aria-invalid={fieldErrors?.coverNote ? true : undefined}
        />
        {fieldErrors?.coverNote?.[0] ? (
          <p className="text-xs text-destructive" role="alert">
            {fieldErrors.coverNote[0]}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Optional. A short message to the reviewers.
          </p>
        )}
      </div>

      <SubmitButton
        className="w-full sm:w-fit"
        pendingLabel={mode === "edit" ? "Resubmitting..." : "Submitting..."}
      >
        {mode === "edit" ? "Resubmit application" : "Submit application"}
      </SubmitButton>
    </form>
  );
}
