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
import type { CourseSection } from "@/types/entities";
import type { SelectOption } from "./approve-student-dialog";

export function CourseSectionFormDialog({
  section,
  courseOptions,
  semesterOptions,
  instructorOptions,
  action,
  defaults,
}: {
  section?: CourseSection;
  courseOptions: SelectOption[];
  semesterOptions: SelectOption[];
  instructorOptions: SelectOption[];
  action: (
    prev: ActionResult<null> | undefined,
    formData: FormData,
  ) => Promise<ActionResult<null>>;
  defaults?: { courseId?: string; semesterId?: string };
}) {
  const isEdit = !!section;
  const [open, setOpen] = useState(false);
  const [courseId, setCourseId] = useState(
    section?.courseId ?? defaults?.courseId ?? "",
  );
  const [semesterId, setSemesterId] = useState(
    section?.semesterId ?? defaults?.semesterId ?? "",
  );
  const [instructorId, setInstructorId] = useState(section?.instructorId ?? "");

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
          disabled={courseOptions.length === 0 || semesterOptions.length === 0}
          title={
            courseOptions.length === 0
              ? "Create a course first"
              : semesterOptions.length === 0
                ? "Create a semester first"
                : undefined
          }
        >
          {isEdit ? "Edit" : "New course section"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit course section" : "New course section"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "The course and semester cannot change after creation."
              : "Sections belong to one course in one semester."}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-5">
          <FormError message={state && !state.ok ? state.message : undefined} />
          <input type="hidden" name="mode" value={isEdit ? "edit" : "create"} />
          <input type="hidden" name="sectionId" value={section?.id ?? ""} />
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name="semesterId" value={semesterId} />
          <input type="hidden" name="instructorId" value={instructorId} />

          {isEdit ? null : (
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Course"
                htmlFor="section-course"
                required
                error={fieldErrors?.courseId?.[0]}
              >
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger id="section-course" className="w-full">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courseOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label="Semester"
                htmlFor="section-semester"
                required
                error={fieldErrors?.semesterId?.[0]}
              >
                <Select value={semesterId} onValueChange={setSemesterId}>
                  <SelectTrigger id="section-semester" className="w-full">
                    <SelectValue placeholder="Select a semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesterOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Section code"
              htmlFor="section-code"
              required
              hint="e.g. A or 01."
              error={fieldErrors?.sectionCode?.[0]}
            >
              <Input
                id="section-code"
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
              htmlFor="section-capacity"
              required
              error={fieldErrors?.capacity?.[0]}
            >
              <Input
                id="section-capacity"
                name="capacity"
                type="number"
                inputMode="numeric"
                min={1}
                max={1000}
                step={1}
                required
                defaultValue={section?.capacity ?? 30}
              />
            </FormField>
          </div>

          <FormField
            label="Instructor"
            htmlFor="section-instructor"
            hint="Optional. Clear to unassign."
            error={fieldErrors?.instructorId?.[0]}
          >
            <Select value={instructorId} onValueChange={setInstructorId}>
              <SelectTrigger id="section-instructor" className="w-full">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                {instructorOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {instructorId ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs"
                onClick={() => setInstructorId("")}
              >
                Unassign instructor
              </Button>
            ) : null}
          </FormField>

          <FormField
            label="Schedule"
            htmlFor="section-schedule"
            hint="Optional free text, e.g. Sun/Tue 10:00-11:30."
            error={fieldErrors?.schedule?.[0]}
          >
            <Input
              id="section-schedule"
              name="schedule"
              maxLength={120}
              defaultValue={section?.schedule ?? ""}
            />
          </FormField>

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
