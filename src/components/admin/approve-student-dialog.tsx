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
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult } from "@/types/api";
import type { StudentSectionAdmin } from "@/types/entities";

export interface SelectOption {
  value: string;
  label: string;
}

export function ApproveStudentDialog({
  applicationId,
  applicantName,
  programId,
  enrollmentYear,
  action,
  semesterOptions,
  sections,
}: {
  applicationId: string;
  applicantName: string;
  programId: string;
  enrollmentYear: number;
  action: (
    prev: ActionResult<null> | undefined,
    formData: FormData,
  ) => Promise<ActionResult<null>>;
  semesterOptions: SelectOption[];
  /** All student sections; filtered to the applicant's program/year/seats. */
  sections: StudentSectionAdmin[];
}) {
  const [open, setOpen] = useState(false);
  const [semesterId, setSemesterId] = useState("");
  const [sectionId, setSectionId] = useState("");

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

  // Only sections matching the applicant's program and enrollment year with a
  // free seat are relevant; the backend re-checks all of this.
  const sectionOptions = sections
    .filter(
      (section) =>
        section.programId === programId &&
        section.enrollmentYear === enrollmentYear &&
        (section.seatsAvailable === undefined || section.seatsAvailable > 0),
    )
    .map((section) => ({
      value: section.id,
      label: `${section.sectionCode} - ${
        section.program?.name ?? "Program"
      } ${section.enrollmentYear}${
        section.seatsAvailable !== undefined
          ? ` (${section.seatsAvailable} seats free)`
          : ""
      }`,
    }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Approve</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Approve {applicantName}&apos;s application?</DialogTitle>
          <DialogDescription>
            This creates the student profile. A unique roll number is required;
            semester and student section are optional.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-5">
          <FormError message={state && !state.ok ? state.message : undefined} />
          <input type="hidden" name="applicationId" value={applicationId} />
          <input type="hidden" name="currentSemesterId" value={semesterId} />
          <input type="hidden" name="sectionId" value={sectionId} />

          <FormField
            label="Roll number"
            htmlFor={`studentId-${applicationId}`}
            required
            hint="Must be unique across all students."
            error={fieldErrors?.studentId?.[0]}
          >
            <Input
              id={`studentId-${applicationId}`}
              name="studentId"
              required
              maxLength={30}
              placeholder="e.g. CSE-2026-014"
            />
          </FormField>

          <FormField
            label="Current semester"
            htmlFor={`semester-${applicationId}`}
            error={fieldErrors?.currentSemesterId?.[0]}
          >
            <Select value={semesterId} onValueChange={setSemesterId}>
              <SelectTrigger
                id={`semester-${applicationId}`}
                className="w-full"
              >
                <SelectValue placeholder="Not set" />
              </SelectTrigger>
              <SelectContent>
                {semesterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {semesterId ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs"
                onClick={() => setSemesterId("")}
              >
                Clear semester
              </Button>
            ) : null}
          </FormField>

          <FormField
            label="Student section"
            htmlFor={`section-${applicationId}`}
            hint="Must match the student's program and enrollment year; seats are checked."
            error={fieldErrors?.sectionId?.[0]}
          >
            <Select value={sectionId} onValueChange={setSectionId}>
              <SelectTrigger id={`section-${applicationId}`} className="w-full">
                <SelectValue
                  placeholder={
                    sectionOptions.length > 0
                      ? "Not assigned"
                      : "No matching free section"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {sectionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {sectionId ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs"
                onClick={() => setSectionId("")}
              >
                Clear section
              </Button>
            ) : null}
          </FormField>

          <FormField
            label="Review note"
            htmlFor={`approve-note-${applicationId}`}
            error={fieldErrors?.reviewNote?.[0]}
          >
            <Textarea
              id={`approve-note-${applicationId}`}
              name="reviewNote"
              rows={3}
              maxLength={500}
              placeholder="Optional note for the student"
            />
          </FormField>

          <DialogFooter>
            <SubmitButton
              className="w-full sm:w-auto"
              pendingLabel="Approving..."
            >
              Approve application
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
