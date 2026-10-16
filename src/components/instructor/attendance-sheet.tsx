"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FormError } from "@/components/auth/form-error";
import { FormField } from "@/components/shared/form-field";
import { StatusBadge } from "@/components/shared/status-badge";
import { SubmitButton } from "@/components/shared/submit-button";
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

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Student</TableHead>
              <TableHead>Recorded</TableHead>
              <TableHead className="w-40">Mark</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.studentId}>
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
