"use client";

import { useActionState, useMemo, useState } from "react";
import { FormError } from "@/components/auth/form-error";
import { FormField } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActionToast } from "@/hooks/use-action-toast";
import { applyStudentAction } from "@/lib/student/actions";
import type { Department, Program } from "@/types/entities";

export interface ApplicationDefaults {
  departmentId?: string;
  programId?: string;
  enrollmentYear?: number;
  phone?: string | null;
}

export function ApplicationForm({
  departments,
  programs,
  defaults,
  mode,
}: {
  departments: Department[];
  programs: Program[];
  defaults?: ApplicationDefaults;
  mode: "create" | "edit";
}) {
  const [state, formAction] = useActionState(applyStudentAction, undefined);
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  useActionToast(state);

  const [departmentId, setDepartmentId] = useState(
    defaults?.departmentId ?? "",
  );
  const [programId, setProgramId] = useState(defaults?.programId ?? "");

  const programOptions = useMemo(
    () => programs.filter((program) => program.departmentId === departmentId),
    [programs, departmentId],
  );

  const department = departments.find((item) => item.id === departmentId);
  const program = programOptions.find((item) => item.id === programId);

  const currentYear = new Date().getFullYear();

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormError message={state && !state.ok ? state.message : undefined} />
      <input type="hidden" name="mode" value={mode} />
      <input
        type="hidden"
        name="departmentName"
        value={department?.name ?? ""}
      />
      <input type="hidden" name="programName" value={program?.name ?? ""} />

      <FormField
        label="Department"
        htmlFor="department"
        required
        error={fieldErrors?.departmentName?.[0]}
      >
        <Select
          value={departmentId}
          onValueChange={(value) => {
            setDepartmentId(value);
            setProgramId("");
          }}
        >
          <SelectTrigger id="department" className="w-full">
            <SelectValue placeholder="Select a department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField
        label="Program"
        htmlFor="program"
        required
        error={fieldErrors?.programName?.[0]}
      >
        <Select
          value={programId}
          onValueChange={setProgramId}
          disabled={!departmentId}
        >
          <SelectTrigger id="program" className="w-full">
            <SelectValue
              placeholder={
                departmentId ? "Select a program" : "Choose a department first"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {programOptions.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField
        label="Enrollment year"
        htmlFor="enrollmentYear"
        required
        error={fieldErrors?.enrollmentYear?.[0]}
      >
        <Input
          id="enrollmentYear"
          name="enrollmentYear"
          type="number"
          inputMode="numeric"
          min={2000}
          max={currentYear + 1}
          defaultValue={defaults?.enrollmentYear ?? currentYear}
          aria-invalid={fieldErrors?.enrollmentYear ? true : undefined}
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

      <SubmitButton
        className="w-full sm:w-auto"
        pendingLabel={mode === "edit" ? "Resubmitting..." : "Submitting..."}
      >
        {mode === "edit" ? "Resubmit application" : "Submit application"}
      </SubmitButton>
    </form>
  );
}
