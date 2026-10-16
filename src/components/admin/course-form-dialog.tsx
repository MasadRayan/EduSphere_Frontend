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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ActionResult } from "@/types/api";
import type { Course } from "@/types/entities";
import type { SelectOption } from "./approve-student-dialog";

export function CourseFormDialog({
  course,
  departmentOptions,
  courseOptions,
  action,
}: {
  course?: Course;
  departmentOptions: SelectOption[];
  /** All courses, used for the prerequisites picker. */
  courseOptions: Course[];
  action: (
    prev: ActionResult<null> | undefined,
    formData: FormData,
  ) => Promise<ActionResult<null>>;
}) {
  const isEdit = !!course;
  const [open, setOpen] = useState(false);
  const [departmentId, setDepartmentId] = useState(course?.departmentId ?? "");
  const [prerequisites, setPrerequisites] = useState<Set<string>>(
    new Set(course?.prerequisites?.map((entry) => entry.prerequisiteId) ?? []),
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

  const togglePrerequisite = (id: string, checked: boolean) => {
    setPrerequisites((previous) => {
      const next = new Set(previous);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const others = courseOptions.filter((option) => option.id !== course?.id);

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
          {isEdit ? "Edit" : "New course"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit course" : "New course"}</DialogTitle>
          <DialogDescription>
            Courses carry the credit hours that drive enrollment fees.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-5">
          <FormError message={state && !state.ok ? state.message : undefined} />
          <input type="hidden" name="mode" value={isEdit ? "edit" : "create"} />
          <input type="hidden" name="courseId" value={course?.id ?? ""} />
          <input type="hidden" name="departmentId" value={departmentId} />
          {[...prerequisites].map((id) => (
            <input key={id} type="hidden" name="prerequisiteIds" value={id} />
          ))}

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Code"
              htmlFor="course-code"
              required
              hint="Shown as a tag, e.g. CSE-101."
              error={fieldErrors?.code?.[0]}
            >
              <Input
                id="course-code"
                name="code"
                required
                minLength={2}
                maxLength={20}
                defaultValue={course?.code ?? ""}
                placeholder="CSE-101"
                className="font-mono uppercase"
              />
            </FormField>

            <FormField
              label="Credit hours"
              htmlFor="course-credits"
              required
              error={fieldErrors?.creditHours?.[0]}
            >
              <Input
                id="course-credits"
                name="creditHours"
                type="number"
                inputMode="numeric"
                min={1}
                max={12}
                step={1}
                required
                defaultValue={course?.creditHours ?? ""}
              />
            </FormField>
          </div>

          <FormField
            label="Title"
            htmlFor="course-title"
            required
            error={fieldErrors?.title?.[0]}
          >
            <Input
              id="course-title"
              name="title"
              required
              minLength={2}
              maxLength={200}
              defaultValue={course?.title ?? ""}
              placeholder="e.g. Introduction to Algorithms"
            />
          </FormField>

          <FormField
            label="Department"
            htmlFor="course-department"
            required
            error={fieldErrors?.departmentId?.[0]}
          >
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger id="course-department" className="w-full">
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

          <FormField
            label="Prerequisites"
            htmlFor="course-prerequisites"
            hint="Optional courses students must pass first."
          >
            <div
              id="course-prerequisites"
              className="max-h-40 overflow-y-auto rounded-lg border border-border p-3"
            >
              {others.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No other courses yet.
                </p>
              ) : (
                others.map((option) => (
                  <label
                    key={option.id}
                    htmlFor={`prereq-${option.id}`}
                    className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-muted/50"
                  >
                    <Checkbox
                      id={`prereq-${option.id}`}
                      checked={prerequisites.has(option.id)}
                      onCheckedChange={(checked) =>
                        togglePrerequisite(option.id, checked === true)
                      }
                      aria-label={`Prerequisite ${option.code}`}
                    />
                    <span className="font-mono text-xs">{option.code}</span>
                    <span className="truncate text-muted-foreground">
                      {option.title}
                    </span>
                  </label>
                ))
              )}
            </div>
          </FormField>

          <DialogFooter>
            <SubmitButton className="w-full sm:w-auto" pendingLabel="Saving...">
              {isEdit ? "Save changes" : "Create course"}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
