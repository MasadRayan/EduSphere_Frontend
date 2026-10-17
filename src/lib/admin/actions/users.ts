"use server";

import type { FormState } from "@/lib/actions/shared";
import { messageFrom, readString } from "@/lib/actions/shared";
import { userRoleSchema, userStatusSchema } from "@/lib/admin/schemas";
import { endpoints } from "@/lib/api/endpoints";
import { serverFetchData } from "@/lib/api/server-fetch";
import type { ActionResult } from "@/types/api";
import { requireAdmin, requireSuperAdmin, revalidateAdmin } from "./shared";

export async function updateUserStatusAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireAdmin();

  const parsed = userStatusSchema.safeParse({
    userId: readString(formData.get("userId")),
    status: readString(formData.get("status")),
  });

  if (!parsed.success) {
    return { ok: false, message: "Pick a valid status." };
  }

  try {
    await serverFetchData(`${endpoints.users}/${parsed.data.userId}/status`, {
      method: "PATCH",
      body: { status: parsed.data.status },
    });
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(
        error,
        "We could not update this account. Please try again.",
      ),
    };
  }

  revalidateAdmin(["/admin/users", "/admin"]);
  return {
    ok: true,
    message:
      parsed.data.status === "BLOCKED" ? "User blocked" : "Account updated",
    data: null,
  };
}

export async function updateUserRoleAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireSuperAdmin();

  const parsed = userRoleSchema.safeParse({
    userId: readString(formData.get("userId")),
    role: readString(formData.get("role")),
  });

  if (!parsed.success) {
    return { ok: false, message: "Pick a valid role." };
  }

  try {
    await serverFetchData(`${endpoints.users}/${parsed.data.userId}/role`, {
      method: "PATCH",
      body: { role: parsed.data.role },
    });
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(
        error,
        "We could not change this role. Please try again.",
      ),
    };
  }

  revalidateAdmin(["/admin/users", "/admin"]);
  return { ok: true, message: "Role updated", data: null };
}

export async function deleteUserAction(
  userId: string,
): Promise<ActionResult<null>> {
  await requireAdmin();

  if (!userId) {
    return { ok: false, message: "Missing user reference." };
  }

  try {
    await serverFetchData(`${endpoints.users}/${userId}`, {
      method: "DELETE",
    });
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(
        error,
        "We could not delete this account. Please try again.",
      ),
    };
  }

  revalidateAdmin(["/admin/users", "/admin"]);
  return { ok: true, message: "User deleted", data: null };
}
