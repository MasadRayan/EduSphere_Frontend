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
import { useActionToast } from "@/hooks/use-action-toast";
import type { ActionResult } from "@/types/api";
import type { CourseSection, InstructorExam } from "@/types/entities";
import { EXAM_TYPES } from "@/types/enums";

export type ExamFormAction = (
  prev: ActionResult<null> | undefined,
  formData: FormData,
) => Promise<ActionResult<null>>;

function toLocalInput(value: string | undefined): string {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  const pad = (input: number) => String(input).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export interface ExamDefaults {
  courseSectionId?: string;
}

export function ExamFormDialog({
  sections,
  mode,
  exam,
  defaults,
  action,
}: {
  sections: CourseSection[];
  mode: "create" | "edit";
  exam?: InstructorExam;
  defaults?: ExamDefaults;
  action: ExamFormAction;
}) {
  const [open, setOpen] = useState(false);

  const [sectionId, setSectionId] = useState(
    exam?.sectionId ?? defaults?.courseSectionId ?? sections[0]?.id ?? "",
  );
  const [type, setType] = useState<string>(exam?.type ?? "MIDTERM");
  const [totalMarks, setTotalMarks] = useState<string>(
    exam ? String(exam.totalMarks) : "20",
  );
  const [date, setDate] = useState<string>(toLocalInput(exam?.date));

  // datetime-local strings carry no zone: convert in the browser (where the
  // user's timezone is known) before the server parses it.
  const dateIso = date ? new Date(date).toISOString() : "";

  // Editing a past exam stays possible, so the future bound is create-only.
  const minDate = toLocalInput(new Date().toISOString());

  const [formState, formAction] = useActionState(
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
    formState && !formState.ok ? formState.fieldErrors : undefined;
  useActionToast(formState);

  const sectionLabel = (section: CourseSection) => {
    const course = section.course;
    const semester = section.semester;
    return `${course?.code ?? "Course"} - Section ${section.sectionCode} ${
      semester ? `(${semester.name} ${semester.year})` : ""
    }`;
  };

  const activeSection = sections.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={mode === "edit" ? "outline" : "default"}
          size="sm"
          className="w-fit"
        >
          {mode === "edit" ? "Edit exam" : "Create exam"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit exam" : "Create exam"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update the type, date or total marks."
              : "Add an exam to one of your sections."}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-5">
          <FormError
            message={formState && !formState.ok ? formState.message : undefined}
          />
          <input type="hidden" name="mode" value={mode} />
          <input type="hidden" name="examId" value={exam?.id ?? ""} />
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="date" value={dateIso} />
          <input type="hidden" name="totalMarks" value={totalMarks} />
          <input type="hidden" name="courseSectionId" value={sectionId} />

          <FormField
            label="Section"
            htmlFor="courseSectionId"
            hint={
              mode === "edit"
                ? "The exam stays in its section once created."
                : activeSection
                  ? undefined
                  : "Ask the admin to assign you a section first."
            }
            error={fieldErrors?.courseSectionId?.[0]}
          >
            <Select
              value={sectionId}
              onValueChange={setSectionId}
              disabled={mode === "edit" || !!defaults?.courseSectionId}
            >
              <SelectTrigger id="courseSectionId" className="w-full">
                <SelectValue
                  placeholder={
                    activeSection ? "Select a section" : "No sections assigned"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {sectionLabel(section)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Type"
            htmlFor="type"
            required
            error={fieldErrors?.type?.[0]}
          >
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXAM_TYPES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option.charAt(0) + option.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Date"
            htmlFor="date"
            required
            hint={
              mode === "create" ? "Choose a future date and time." : undefined
            }
            error={fieldErrors?.date?.[0]}
          >
            <Input
              id="date"
              type="datetime-local"
              required
              min={mode === "create" ? minDate : undefined}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              aria-invalid={fieldErrors?.date ? true : undefined}
            />
          </FormField>

          <FormField
            label="Total marks"
            htmlFor="totalMarks"
            required
            error={fieldErrors?.totalMarks?.[0]}
          >
            <Input
              id="totalMarks"
              type="number"
              inputMode="numeric"
              min={1}
              max={1000}
              step={1}
              required
              value={totalMarks}
              onChange={(event) => setTotalMarks(event.target.value)}
              aria-invalid={fieldErrors?.totalMarks ? true : undefined}
            />
          </FormField>

          <DialogFooter>
            <SubmitButton
              className="w-full sm:w-auto"
              pendingLabel={mode === "edit" ? "Saving..." : "Creating..."}
            >
              {mode === "edit" ? "Save changes" : "Create exam"}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
