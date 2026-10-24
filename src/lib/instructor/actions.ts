"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/lib/actions/shared";
import { fieldErrorsFrom, messageFrom, readString } from "@/lib/actions/shared";
import { endpoints } from "@/lib/api/endpoints";
import { serverFetchData } from "@/lib/api/server-fetch";
import { requireRole } from "@/lib/auth/roles";
import {
  applySchema,
  attendanceRecordSchema,
  attendanceSheetSchema,
  createExamSchema,
  examSchema,
  gradingSchema,
  profileSchema,
  resultRowSchema,
  singleResultSchema,
} from "@/lib/instructor/schemas";
import type { ActionResult } from "@/types/api";

export async function applyInstructorAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireRole("INSTRUCTOR");

  const parsed = applySchema.safeParse({
    phone: readString(formData.get("phone")) || undefined,
    departmentName: readString(formData.get("departmentName")),
    designation: readString(formData.get("designation")) || undefined,
    coverNote: readString(formData.get("coverNote")) || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the details below and try again.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const isEdit = readString(formData.get("mode")) === "edit";

  try {
    await serverFetchData(endpoints.instructor.apply, {
      method: isEdit ? "PUT" : "POST",
      body: parsed.data,
    });
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(
        error,
        "We could not submit your application. Please try again.",
      ),
    };
  }

  revalidatePath("/instructor/apply");
  revalidatePath("/instructor/profile");
  return {
    ok: true,
    message: isEdit ? "Application resubmitted" : "Application submitted",
    data: null,
  };
}

export async function updateInstructorProfileAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireRole("INSTRUCTOR");

  const parsed = profileSchema.safeParse({
    fullName: readString(formData.get("fullName")),
    phone: readString(formData.get("phone")) || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the details below and try again.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  try {
    await serverFetchData(endpoints.instructor.profile, {
      method: "PATCH",
      body: parsed.data,
    });
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(error, "We could not save your profile."),
    };
  }

  revalidatePath("/instructor/profile");
  revalidatePath("/instructor");
  return { ok: true, message: "Profile updated", data: null };
}

export async function saveExamAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireRole("INSTRUCTOR");

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

  revalidatePath("/instructor/exams");
  revalidatePath("/instructor/results");
  revalidatePath("/instructor");
  return {
    ok: true,
    message: isEdit ? "Exam updated" : "Exam created",
    data: null,
  };
}

export async function deleteExamAction(
  examId: string,
): Promise<ActionResult<null>> {
  await requireRole("INSTRUCTOR");

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

  revalidatePath("/instructor/exams");
  revalidatePath("/instructor/results");
  revalidatePath("/instructor/sections");
  revalidatePath("/instructor/attendance");
  revalidatePath("/instructor");
  return { ok: true, message: "Exam deleted", data: null };
}

export async function markAttendanceAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireRole("INSTRUCTOR");

  const base = attendanceSheetSchema.safeParse({
    courseSectionId: readString(formData.get("courseSectionId")),
    date: readString(formData.get("date")),
  });

  if (!base.success) {
    return {
      ok: false,
      message: "Pick a course section and a date.",
      fieldErrors: fieldErrorsFrom(base.error),
    };
  }

  const records: { studentId: string; status: string }[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("status-")) {
      continue;
    }
    const row = attendanceRecordSchema.safeParse({
      studentId: key.slice("status-".length),
      status: typeof value === "string" ? value : "",
    });
    if (row.success) {
      records.push({
        studentId: row.data.studentId,
        status: row.data.status,
      });
    }
  }

  if (records.length === 0) {
    return { ok: false, message: "No students to mark for this section." };
  }

  try {
    await serverFetchData(endpoints.attendance, {
      method: "POST",
      body: {
        courseSectionId: base.data.courseSectionId,
        date: `${base.data.date}T00:00:00.000Z`,
        records,
      },
    });
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(
        error,
        "We could not save attendance. Please try again.",
      ),
    };
  }

  revalidatePath("/instructor/attendance");
  revalidatePath("/instructor/sections");
  revalidatePath("/instructor");
  return { ok: true, message: "Attendance saved", data: null };
}

const NON_EMPTY_MARKS = (value: FormDataEntryValue | null): value is string =>
  typeof value === "string" && value.trim() !== "";

export async function enterResultsAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireRole("INSTRUCTOR");

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

  revalidatePath("/instructor/results");
  revalidatePath("/instructor/exams");
  revalidatePath("/instructor/sections");
  revalidatePath("/instructor/attendance");
  revalidatePath("/instructor");
  return { ok: true, message: "Results saved", data: null };
}

export async function updateResultAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireRole("INSTRUCTOR");

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

  revalidatePath("/instructor/results");
  revalidatePath("/instructor/exams");
  revalidatePath("/instructor/sections");
  revalidatePath("/instructor/attendance");
  revalidatePath("/instructor");
  return { ok: true, message: "Result updated", data: null };
}
