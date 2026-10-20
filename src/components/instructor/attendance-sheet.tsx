"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FormError } from "@/components/auth/form-error";
import { FormField } from "@/components/shared/form-field";
import { StatusBadge } from "@/components/shared/status-badge";
import { SubmitButton } from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useActionToast } from "@/hooks/use-action-toast";
import { markAttendanceAction } from "@/lib/instructor/actions";
import type { AttendanceStatus } from "@/types/enums";
import { ATTENDANCE_STATUSES } from "@/types/enums";

export interface AttendanceRow {
  /** StudentProfile id, used in the POST records payload. */
  studentId: string;
  /** Display code like STU-2023-0001. */
  code: string;
  name: string;
  email: string;
  existingStatus: AttendanceStatus | null;
}

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LATE: "Late",
  EXCUSED: "Excused",
};

export function AttendanceSheet({
  courseSectionId,
  date,
  rows,
}: {
  courseSectionId: string;
  date: string;
  rows: AttendanceRow[];
}) {
  const [state, formAction] = useActionState(markAttendanceAction, undefined);
  useActionToast(state);

  const lastState = useRef(state);
  useEffect(() => {
    if (state === lastState.current) {
      return;
    }
    lastState.current = state;
    if (state?.ok) {
      toast.success(state.message);
    }
  }, [state]);

  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(
    () =>
      Object.fromEntries(
        rows.map((row) => [row.studentId, row.existingStatus ?? "PRESENT"]),
      ) as Record<string, AttendanceStatus>,
  );

  const alreadyMarked = rows.some((row) => row.existingStatus);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<AttendanceStatus>("PRESENT");

  const allSelected = rows.length > 0 && selected.size === rows.length;
  const someSelected = selected.size > 0 && !allSelected;

  const toggleAll = (checked: boolean | "indeterminate") => {
    setSelected(
      checked === true ? new Set(rows.map((row) => row.studentId)) : new Set(),
    );
  };

  const toggleRow = (studentId: string, checked: boolean | "indeterminate") => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked === true) {
        next.add(studentId);
      } else {
        next.delete(studentId);
      }
      return next;
    });
  };

  const applyBulkStatus = () => {
    if (selected.size === 0) {
      return;
    }

    setStatuses((prev) => {
      const next = { ...prev };
      for (const studentId of selected) {
        next[studentId] = bulkStatus;
      }
      return next;
    });

    toast.success(
      `Marked ${selected.size} ${
        selected.size === 1 ? "student" : "students"
      } as ${STATUS_LABELS[bulkStatus]}`,
    );
  };

  const markAllPresent = () => {
    setSelected(new Set(rows.map((row) => row.studentId)));
    setStatuses((prev) => {
      const next = { ...prev };
      for (const row of rows) {
        next[row.studentId] = "PRESENT";
      }
      return next;
    });
    toast.success(
      `Marked all ${rows.length} ${
        rows.length === 1 ? "student" : "students"
      } as Present`,
    );
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormError message={state && !state.ok ? state.message : undefined} />
      <input type="hidden" name="courseSectionId" value={courseSectionId} />

      <div className="flex flex-wrap items-end gap-4">
        <FormField
          label="Date"
          htmlFor="attendance-date"
          required
          className="w-44"
        >
          <Input
            id="attendance-date"
            name="date"
            type="date"
            required
            max={today}
            defaultValue={date}
          />
        </FormField>
        <p className="pb-2 text-xs text-muted-foreground">
          {alreadyMarked
            ? "Marks already recorded for this date are preselected. Saving again overwrites them."
            : "No marks recorded for this date yet."}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-border bg-card px-4 py-3">
        <p className="text-sm">
          <span className="font-medium">{selected.size}</span>{" "}
          <span className="text-muted-foreground">
            of {rows.length} selected
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          Selection only changes the status. Saving records every student in the
          section.
        </p>
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <Select
            value={bulkStatus}
            onValueChange={(value) => setBulkStatus(value as AttendanceStatus)}
          >
            <SelectTrigger
              className="w-36"
              aria-label="Status to apply to selected students"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ATTENDANCE_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={applyBulkStatus}
            disabled={selected.size === 0}
          >
            Apply
          </Button>
          {selected.size > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelected(new Set())}
            >
              Clear
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={markAllPresent}
          >
            Mark all present
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-10">
                <Checkbox
                  checked={
                    allSelected ? true : someSelected ? "indeterminate" : false
                  }
                  onCheckedChange={toggleAll}
                  aria-label="Select all students"
                />
              </TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Recorded</TableHead>
              <TableHead className="w-40">Mark</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.studentId}
                className={
                  selected.has(row.studentId) ? "bg-muted/30" : undefined
                }
              >
                <TableCell>
                  <Checkbox
                    checked={selected.has(row.studentId)}
                    onCheckedChange={(checked) =>
                      toggleRow(row.studentId, checked)
                    }
                    aria-label={`Select ${row.name}`}
                  />
                </TableCell>
                <TableCell>
                  <input
                    type="hidden"
                    name={`status-${row.studentId}`}
                    value={statuses[row.studentId] ?? "PRESENT"}
                  />
                  <div className="space-y-0.5">
                    <p className="font-medium">{row.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {row.code}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {row.email}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  {row.existingStatus ? (
                    <StatusBadge status={row.existingStatus} />
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Select
                    value={statuses[row.studentId] ?? "PRESENT"}
                    onValueChange={(value) =>
                      setStatuses((prev) => ({
                        ...prev,
                        [row.studentId]: value as AttendanceStatus,
                      }))
                    }
                  >
                    <SelectTrigger
                      aria-label={`Mark attendance for ${row.name}`}
                      className="w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ATTENDANCE_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <SubmitButton
        className="w-full sm:w-fit"
        pendingLabel="Saving attendance..."
      >
        Save attendance
      </SubmitButton>
    </form>
  );
}
