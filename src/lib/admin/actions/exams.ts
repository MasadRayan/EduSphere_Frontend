"use server";

import type { FormState } from "@/lib/actions/shared";
import { fieldErrorsFrom, messageFrom, readString } from "@/lib/actions/shared";
import { endpoints } from "@/lib/api/endpoints";
import { serverFetchData } from "@/lib/api/server-fetch";
import {
  createExamSchema,
  examSchema,
  gradingSchema,
  resultRowSchema,
  singleResultSchema,
} from "@/lib/schemas/academic";
import type { ActionResult } from "@/types/api";
import { requireAdmin, revalidateAdmin } from "./shared";

const NON_EMPTY_MARKS = (value: FormDataEntryValue | null): value is string =>
  typeof value === "string" && value.trim() !== "";

export async function adminSaveExamAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireAdmin();

  const isEdit = readString(formData.get("mode")) === "edit";

  const parsed = (isEdit ? examSchema : createExamSchema).safeParse({
    courseSectionId: readString(formData.get("courseSectionId")),
    type: readString(formData.get("type")),
    date: readString(formData.get("date")),
    totalMarks: readString(formData.get("totalMarks")),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the details below and try again.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const examId = readString(formData.get("examId"));
  if (isEdit && !examId) {
    return { ok: false, message: "Missing exam reference." };
  }

  try {
    if (isEdit) {
      await serverFetchData(`${endpoints.exams}/${examId}`, {
        method: "PATCH",
        body: {
          type: parsed.data.type,
          date: parsed.data.date.toISOString(),
          totalMarks: parsed.data.totalMarks,
        },
      });
    } else {
      await serverFetchData(endpoints.exams, {
        method: "POST",
        body: {
          courseSectionId: parsed.data.courseSectionId,
          type: parsed.data.type,
          date: parsed.data.date.toISOString(),
          totalMarks: parsed.data.totalMarks,
        },
      });
    }
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(
        error,
        "We could not save this exam. Please try again.",
      ),
    };
  }

  revalidateAdmin(["/admin/exams", "/admin/results", "/admin"]);
  return {
    ok: true,
    message: isEdit ? "Exam updated" : "Exam created",
    data: null,
  };
}

export async function adminDeleteExamAction(
  examId: string,
): Promise<ActionResult<null>> {
  await requireAdmin();

  if (!examId) {
    return { ok: false, message: "Missing exam reference." };
  }

  try {
    await serverFetchData(`${endpoints.exams}/${examId}`, {
      method: "DELETE",
    });
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(
        error,
        "We could not delete this exam. Please try again.",
      ),
    };
  }

  revalidateAdmin(["/admin/exams", "/admin/results", "/admin"]);
  return { ok: true, message: "Exam deleted", data: null };
}

export async function adminEnterResultsAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireAdmin();

  const base = gradingSchema.safeParse({
    examId: readString(formData.get("examId")),
  });

  if (!base.success) {
    return { ok: false, message: "Missing exam reference." };
  }

  const records: { studentId: string; marksObtained: number }[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("marks-") || !NON_EMPTY_MARKS(value)) {
      continue;
    }
    const row = resultRowSchema.safeParse({
      studentId: key.slice("marks-".length),
      marksObtained: value,
    });
    if (row.success) {
      records.push({
        studentId: row.data.studentId,
        marksObtained: row.data.marksObtained,
      });
    }
  }

  if (records.length === 0) {
    return {
      ok: false,
      message: "Enter marks for at least one student.",
    };
  }

  try {
    await serverFetchData(endpoints.results, {
      method: "POST",
      body: { examId: base.data.examId, records },
    });
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(
        error,
        "We could not save these marks. Please try again.",
      ),
    };
  }

  revalidateAdmin(["/admin/results", "/admin/exams", "/admin"]);
  return { ok: true, message: "Results saved", data: null };
}

export async function adminUpdateResultAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireAdmin();

  const parsed = singleResultSchema.safeParse({
    resultId: readString(formData.get("resultId")),
    marksObtained: readString(formData.get("marksObtained")),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Enter valid marks.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  try {
    await serverFetchData(`${endpoints.results}/${parsed.data.resultId}`, {
      method: "PATCH",
      body: { marksObtained: parsed.data.marksObtained },
    });
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(
        error,
        "We could not update this result. Please try again.",
      ),
    };
  }

  revalidateAdmin(["/admin/results", "/admin/exams", "/admin"]);
  return { ok: true, message: "Result updated", data: null };
}
