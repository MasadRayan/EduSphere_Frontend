"use server";

import type { FormState } from "@/lib/actions/shared";
import { fieldErrorsFrom, messageFrom, readString } from "@/lib/actions/shared";
import { registrationOverrideSchema } from "@/lib/admin/schemas";
import { endpoints } from "@/lib/api/endpoints";
import { serverFetchData } from "@/lib/api/server-fetch";
import type { ActionResult } from "@/types/api";
import { requireAdmin, revalidateAdmin } from "./shared";

export async function overrideRegistrationStatusAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireAdmin();

  const parsed = registrationOverrideSchema.safeParse({
    registrationId: readString(formData.get("registrationId")),
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
      `${endpoints.courseRegistrations.base}/${parsed.data.registrationId}/status`,
      { method: "PATCH", body: { status: parsed.data.status } },
    );
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(
        error,
        "We could not override this status. Please try again.",
      ),
    };
  }

  revalidateAdmin(["/admin/enrollments", "/admin"]);
  return { ok: true, message: "Status overridden", data: null };
}

export async function cancelEnrollmentAdminAction(
  enrollmentId: string,
): Promise<ActionResult<null>> {
  await requireAdmin();

  if (!enrollmentId) {
    return { ok: false, message: "Missing enrollment reference." };
  }

  try {
    await serverFetchData(
      `${endpoints.courseRegistrations.base}/${enrollmentId}/cancel`,
      { method: "PATCH" },
    );
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(
        error,
        "We could not cancel this enrollment. Please try again.",
      ),
    };
  }

  revalidateAdmin(["/admin/enrollments", "/admin/payments", "/admin"]);
  return { ok: true, message: "Enrollment cancelled", data: null };
}
