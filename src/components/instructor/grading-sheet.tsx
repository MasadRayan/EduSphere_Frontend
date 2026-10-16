"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { FormError } from "@/components/auth/form-error";
import { EditResultDialog } from "@/components/instructor/edit-result-dialog";
import { SubmitButton } from "@/components/shared/submit-button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useActionToast } from "@/hooks/use-action-toast";
import type { ActionResult } from "@/types/api";
import type { InstructorResultRow, SectionStudent } from "@/types/entities";

export type EnterResultsAction = (
  prev: ActionResult<null> | undefined,
  formData: FormData,
) => Promise<ActionResult<null>>;

export type UpdateResultAction = (
  prev: ActionResult<null> | undefined,
  formData: FormData,
) => Promise<ActionResult<null>>;

export interface GradingRow {
  /** StudentProfile id, used in the POST records payload. */
  profileId: string;
  student: SectionStudent;
  result: InstructorResultRow | null;
}

export function GradingSheet({
  examId,
  totalMarks,
  rows,
  enterAction,
  updateAction,
}: {
  examId: string;
  totalMarks: number;
  rows: GradingRow[];
  enterAction: EnterResultsAction;
  updateAction: UpdateResultAction;
}) {
  const [state, formAction] = useActionState(enterAction, undefined);
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

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormError message={state && !state.ok ? state.message : undefined} />
      <input type="hidden" name="examId" value={examId} />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Student</TableHead>
              <TableHead className="w-28">Marks</TableHead>
              <TableHead className="w-24 text-right">Grade</TableHead>
              <TableHead className="w-36 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              return (
                <TableRow key={row.profileId}>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="font-medium">{row.student.user.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {row.student.studentId}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {row.student.user.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      name={`marks-${row.profileId}`}
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={totalMarks}
                      step={1}
                      defaultValue={
                        row.result?.marksObtained != null
                          ? row.result.marksObtained
                          : ""
                      }
                      aria-label={`Marks for ${row.student.user.name}`}
                      placeholder={`0-${totalMarks}`}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    {row.result?.grade ? (
                      <span className="font-mono font-medium">
                        {row.result.grade}
                        <span className="block text-xs text-muted-foreground">
                          {row.result.gradePoint?.toFixed(1) ?? "-"}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.result?.id ? (
                      <EditResultDialog
                        resultId={row.result.id}
                        studentName={row.student.user.name}
                        totalMarks={totalMarks}
                        currentMarks={row.result.marksObtained}
                        updateAction={updateAction}
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Save marks below
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <SubmitButton className="w-full sm:w-fit" pendingLabel="Saving marks...">
        Save marks
      </SubmitButton>
      <p className="text-xs text-muted-foreground">
        Blank rows are ignored. Saving again overwrites existing marks and
        recalculates grades.
      </p>
    </form>
  );
}
