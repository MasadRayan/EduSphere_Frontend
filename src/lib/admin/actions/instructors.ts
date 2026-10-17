"use server";

import type { FormState } from "@/lib/actions/shared";
import { fieldErrorsFrom, messageFrom, readString } from "@/lib/actions/shared";
import { instructorUpdateSchema } from "@/lib/admin/schemas";
import { endpoints } from "@/lib/api/endpoints";
import { serverFetchData } from "@/lib/api/server-fetch";
import type { ActionResult } from "@/types/api";
import { requireAdmin, revalidateAdmin } from "./shared";

export async function updateInstructorAdminAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireAdmin();

  const instructorId = readString(formData.get("instructorId"));
  if (!instructorId) {
    return { ok: false, message: "Missing instructor reference." };
  }

  const parsed = instructorUpdateSchema.safeParse({
    fullName: readString(formData.get("fullName")),
    phone: readString(formData.get("phone")) || undefined,
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
    await serverFetchData(`${endpoints.instructor.list}/${instructorId}`, {
      method: "PATCH",
      body: parsed.data,
    });
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(error, "We could not save this instructor."),
    };
  }

  revalidateAdmin(["/admin/instructors", "/admin/course-sections", "/admin"]);
  return { ok: true, message: "Instructor updated", data: null };
}

export async function deleteInstructorAdminAction(
  instructorId: string,
): Promise<ActionResult<null>> {
  await requireAdmin();

  if (!instructorId) {
    return { ok: false, message: "Missing instructor reference." };
  }

  try {
    await serverFetchData(`${endpoints.instructor.list}/${instructorId}`, {
      method: "DELETE",
    });
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(
        error,
        "We could not delete this instructor. Please try again.",
      ),
    };
  }

  revalidateAdmin(["/admin/instructors", "/admin/course-sections", "/admin"]);
  return { ok: true, message: "Instructor deleted", data: null };
}
