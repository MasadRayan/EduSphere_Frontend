"use server";

import type { FormState } from "@/lib/actions/shared";
import { fieldErrorsFrom, messageFrom, readString } from "@/lib/actions/shared";
import {
  instructorApproveSchema,
  rejectSchema,
  studentApproveSchema,
} from "@/lib/admin/schemas";
import { endpoints } from "@/lib/api/endpoints";
import { serverFetchData } from "@/lib/api/server-fetch";
import type { ActionResult } from "@/types/api";
import { requireAdmin, revalidateAdmin } from "./shared";

export async function approveStudentApplicationAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireAdmin();

  const applicationId = readString(formData.get("applicationId"));
  if (!applicationId) {
    return { ok: false, message: "Missing application reference." };
  }

  const parsed = studentApproveSchema.safeParse({
    studentId: readString(formData.get("studentId")),
    reviewNote: readString(formData.get("reviewNote")) || undefined,
    currentSemesterId:
      readString(formData.get("currentSemesterId")) || undefined,
    sectionId: readString(formData.get("sectionId")) || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the details below and try again.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  try {
    await serverFetchData(
      `${endpoints.student.applications}/${applicationId}/approve`,
      { method: "PATCH", body: parsed.data },
    );
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(
        error,
        "We could not approve this application. Please try again.",
      ),
    };
  }

  revalidateAdmin([
    "/admin/student-applications",
    "/admin/students",
    "/admin/users",
    "/admin",
  ]);
  return { ok: true, message: "Application approved", data: null };
}

export async function rejectStudentApplicationAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireAdmin();

  const applicationId = readString(formData.get("applicationId"));
  if (!applicationId) {
    return { ok: false, message: "Missing application reference." };
  }

  const parsed = rejectSchema.safeParse({
    reviewNote: readString(formData.get("reviewNote")) || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the details below and try again.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  try {
    await serverFetchData(
      `${endpoints.student.applications}/${applicationId}/reject`,
      { method: "PATCH", body: parsed.data },
    );
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(
        error,
        "We could not reject this application. Please try again.",
      ),
    };
  }

  revalidateAdmin(["/admin/student-applications", "/admin"]);
  return { ok: true, message: "Application rejected", data: null };
}

export async function approveInstructorApplicationAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireAdmin();

  const applicationId = readString(formData.get("applicationId"));
  if (!applicationId) {
    return { ok: false, message: "Missing application reference." };
  }

  const parsed = instructorApproveSchema.safeParse({
    reviewNote: readString(formData.get("reviewNote")) || undefined,
    designation: readString(formData.get("designation")) || undefined,
    departmentId: readString(formData.get("departmentId")) || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the details below and try again.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  try {
    await serverFetchData(
      `${endpoints.instructor.applications}/${applicationId}/approve`,
      { method: "PATCH", body: parsed.data },
    );
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(
        error,
        "We could not approve this application. Please try again.",
      ),
    };
  }

  revalidateAdmin([
    "/admin/instructor-applications",
    "/admin/instructors",
    "/admin/users",
    "/admin",
  ]);
  return { ok: true, message: "Application approved", data: null };
}

export async function rejectInstructorApplicationAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireAdmin();

  const applicationId = readString(formData.get("applicationId"));
  if (!applicationId) {
    return { ok: false, message: "Missing application reference." };
  }

  const parsed = rejectSchema.safeParse({
    reviewNote: readString(formData.get("reviewNote")) || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the details below and try again.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  try {
    await serverFetchData(
      `${endpoints.instructor.applications}/${applicationId}/reject`,
      { method: "PATCH", body: parsed.data },
    );
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(
        error,
        "We could not reject this application. Please try again.",
      ),
    };
  }

  revalidateAdmin(["/admin/instructor-applications", "/admin"]);
  return { ok: true, message: "Application rejected", data: null };
}
