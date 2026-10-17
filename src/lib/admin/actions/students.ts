"use server";

import type { FormState } from "@/lib/actions/shared";
import { fieldErrorsFrom, messageFrom, readString } from "@/lib/actions/shared";
import {
  studentSectionAssignSchema,
  studentSemesterSchema,
  studentStatusSchema,
} from "@/lib/admin/schemas";
import { endpoints } from "@/lib/api/endpoints";
import { serverFetchData } from "@/lib/api/server-fetch";
import type { ActionResult } from "@/types/api";
import { requireAdmin, revalidateAdmin } from "./shared";

export async function setStudentSemesterAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireAdmin();

  const parsed = studentSemesterSchema.safeParse({
    profileId: readString(formData.get("profileId")),
    currentSemesterId: readString(formData.get("currentSemesterId")),
  });

  if (!parsed.success) {
    return { ok: false, message: "Missing student reference." };
  }

  try {
    await serverFetchData(
      `${endpoints.student.base}/${parsed.data.profileId}/current-semester`,
      {
        method: "PATCH",
        body: { currentSemesterId: parsed.data.currentSemesterId || null },
      },
    );
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(
        error,
        "We could not update this student's semester.",
      ),
    };
  }

  revalidateAdmin(["/admin/students", "/admin"]);
  return { ok: true, message: "Semester updated", data: null };
}

export async function assignStudentSectionAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireAdmin();

  const parsed = studentSectionAssignSchema.safeParse({
    profileId: readString(formData.get("profileId")),
    sectionId: readString(formData.get("sectionId")),
  });

  if (!parsed.success) {
    return { ok: false, message: "Missing student reference." };
  }

  try {
    await serverFetchData(
      `${endpoints.student.base}/${parsed.data.profileId}/section`,
      {
        method: "PATCH",
        body: { sectionId: parsed.data.sectionId || null },
      },
    );
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(error, "We could not assign this section."),
    };
  }

  revalidateAdmin(["/admin/students", "/admin/student-sections", "/admin"]);
  return { ok: true, message: "Section assigned", data: null };
}

export async function updateStudentStatusAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireAdmin();

  const parsed = studentStatusSchema.safeParse({
    profileId: readString(formData.get("profileId")),
    status: readString(formData.get("status")),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Pick a valid status.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  try {
    await serverFetchData(
      `${endpoints.student.base}/${parsed.data.profileId}/status`,
      { method: "PATCH", body: { status: parsed.data.status } },
    );
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(error, "We could not update this status."),
    };
  }

  revalidateAdmin(["/admin/students", "/admin"]);
  return { ok: true, message: "Status updated", data: null };
}
