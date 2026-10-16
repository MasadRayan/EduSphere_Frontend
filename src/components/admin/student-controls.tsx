"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  assignStudentSectionAction,
  setStudentSemesterAction,
  updateStudentStatusAction,
} from "@/lib/admin/actions";
import { STUDENT_STATUSES } from "@/types/enums";
import type { SelectOption } from "./approve-student-dialog";

function useRunAction() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const run = (
    action: (prev: undefined, formData: FormData) => Promise<unknown>,
    formData: FormData,
    onDone: () => void,
  ) => {
    startTransition(async () => {
      const result = (await action(undefined, formData)) as {
        ok: boolean;
        message: string;
      };
      if (result.ok) {
        toast.success(result.message);
        onDone();
        router.refresh();
        return;
      }
      toast.error(result.message);
    });
  };
  return { pending, run };
}

function ClearButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-auto px-2 py-1 text-xs"
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

export function SetSemesterDialog({
  profileId,
  studentName,
  options,
}: {
  profileId: string;
  studentName: string;
  options: SelectOption[];
}) {
  const [open, setOpen] = useState(false);
  const [semesterId, setSemesterId] = useState("");
  const { pending, run } = useRunAction();

  const onSubmit = () => {
    const formData = new FormData();
    formData.set("profileId", profileId);
    formData.set("currentSemesterId", semesterId);
    run(setStudentSemesterAction, formData, () => setOpen(false));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Set semester
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Current semester for {studentName}</DialogTitle>
          <DialogDescription>
            Clearing the semester removes it until the next enrollment.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Select value={semesterId} onValueChange={setSemesterId}>
            <SelectTrigger aria-label="Semester" className="w-full">
              <SelectValue placeholder="Not set" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {semesterId ? (
            <ClearButton
              label="Clear semester"
              onClick={() => setSemesterId("")}
            />
          ) : null}
        </div>
        <DialogFooter>
          <Button onClick={onSubmit} disabled={pending}>
            {pending ? "Saving..." : "Save semester"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AssignSectionDialog({
  profileId,
  studentName,
  options,
}: {
  profileId: string;
  studentName: string;
  options: SelectOption[];
}) {
  const [open, setOpen] = useState(false);
  const [sectionId, setSectionId] = useState("");
  const { pending, run } = useRunAction();

  const onSubmit = () => {
    const formData = new FormData();
    formData.set("profileId", profileId);
    formData.set("sectionId", sectionId);
    run(assignStudentSectionAction, formData, () => setOpen(false));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Assign section
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Student section for {studentName}</DialogTitle>
          <DialogDescription>
            The section must match the student&apos;s program and enrollment
            year, and has limited seats.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Select value={sectionId} onValueChange={setSectionId}>
            <SelectTrigger aria-label="Student section" className="w-full">
              <SelectValue placeholder="Not assigned" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {sectionId ? (
            <ClearButton label="Unassign" onClick={() => setSectionId("")} />
          ) : null}
        </div>
        <DialogFooter>
          <Button onClick={onSubmit} disabled={pending}>
            {pending ? "Saving..." : "Save section"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function UpdateStatusDialog({
  profileId,
  studentName,
}: {
  profileId: string;
  studentName: string;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string>("ACTIVE");
  const { pending, run } = useRunAction();

  const onSubmit = () => {
    const formData = new FormData();
    formData.set("profileId", profileId);
    formData.set("status", status);
    run(updateStudentStatusAction, formData, () => setOpen(false));
  };

  const label = (value: string) =>
    value
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Update status
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Status for {studentName}</DialogTitle>
          <DialogDescription>
            Only active students can enroll and attend classes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger aria-label="Student status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STUDENT_STATUSES.map((option) => (
                <SelectItem key={option} value={option}>
                  {label(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button onClick={onSubmit} disabled={pending}>
            {pending ? "Saving..." : "Save status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
