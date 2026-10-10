"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ZodError } from "zod";
import { endpoints } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/errors";
import { serverFetchData } from "@/lib/api/server-fetch";
import { getSession } from "@/lib/auth/session";
import { setFlash } from "@/lib/flash";
import type { ActionResult } from "@/types/api";
import type { StudentMe } from "@/types/entities";
import { applySchema, enrollSchema, profileSchema } from "./schemas";

type FormState = ActionResult<null> | undefined;

interface EnrollResult {
  paymentUrl: string;
  paymentID: string;
  merchantInvoiceNumber: string;
  enrollmentId: string;
  totalCredits: number;
  totalFee: number;
  sections: {
    courseId: string;
    courseCode: string;
    sectionId: string;
    sectionCode: string;
  }[];
}

function fieldErrorsFrom(error: ZodError): Record<string, string[]> {
  const flat = error.flatten().fieldErrors;
  const result: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(flat)) {
    if (value?.length) {
      result[key] = value;
    }
  }
  return result;
}

function messageFrom(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  return fallback;
}

function readString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

async function requireStudent(): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }
}

export async function applyStudentAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireStudent();

  const parsed = applySchema.safeParse({
    phone: readString(formData.get("phone")) || undefined,
    departmentName: readString(formData.get("departmentName")),
    programName: readString(formData.get("programName")),
    enrollmentYear: readString(formData.get("enrollmentYear")),
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
    await serverFetchData(endpoints.student.apply, {
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

  const store = await cookies();
  setFlash(store, {
    type: "success",
    message: isEdit ? "Application resubmitted" : "Application submitted",
    description: "We will review it and notify you by email.",
  });

  revalidatePath("/student/apply");
  redirect("/student");
}

export async function updateProfileAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireStudent();

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
    await serverFetchData<StudentMe["studentProfile"]>(
      endpoints.student.profile,
      {
        method: "PATCH",
        body: parsed.data,
      },
    );
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(error, "We could not save your profile."),
    };
  }

  revalidatePath("/student/profile");
  revalidatePath("/student");
  return { ok: true, message: "Profile updated", data: null };
}

export async function cancelEnrollmentAction(
  enrollmentId: string,
): Promise<ActionResult<null>> {
  await requireStudent();

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

  revalidatePath("/student/enrollments");
  revalidatePath("/student/payments");
  revalidatePath("/student");
  return { ok: true, message: "Enrollment cancelled", data: null };
}

export async function enrollAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireStudent();

  const parsed = enrollSchema.safeParse({
    courseIds: formData.getAll("courseIds").map(readString),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Select valid courses.",
    };
  }

  let result: EnrollResult;
  try {
    result = await serverFetchData<EnrollResult>(
      endpoints.courseRegistrations.enroll,
      { method: "POST", body: parsed.data },
    );
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(
        error,
        "We could not start your enrollment. Please try again.",
      ),
    };
  }

  revalidatePath("/student/enrollments");
  revalidatePath("/student/payments");
  redirect(result.paymentUrl);
}
