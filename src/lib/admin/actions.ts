"use server";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";
import {
  courseSchema,
  courseSectionCreateSchema,
  courseSectionUpdateSchema,
  departmentSchema,
  instructorApproveSchema,
  instructorUpdateSchema,
  programSchema,
  registrationOverrideSchema,
  rejectSchema,
  semesterSchema,
  studentApproveSchema,
  studentSectionAssignSchema,
  studentSectionCreateSchema,
  studentSectionUpdateSchema,
  studentSemesterSchema,
  studentStatusSchema,
  userRoleSchema,
  userStatusSchema,
} from "@/lib/admin/schemas";
import { endpoints } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/errors";
import { serverFetchData } from "@/lib/api/server-fetch";
import { requireRole } from "@/lib/auth/roles";
import {
  examSchema,
  gradingSchema,
  resultRowSchema,
  singleResultSchema,
} from "@/lib/instructor/schemas";
import type { ActionResult } from "@/types/api";

type FormState = ActionResult<null> | undefined;

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

function toIsoDate(date: string): string {
  return `${date}T00:00:00.000Z`;
}

function revalidateAdmin(paths: string[]): void {
  for (const path of paths) {
    revalidatePath(path);
  }
}

/**
 * Shared role guards for admin server actions. Every action re-checks the
 * session itself; wrong roles land on their own dashboard like the layout
 * guards do.
 */
async function requireAdmin(): Promise<void> {
  await requireRole("ADMIN", "SUPER_ADMIN");
}

async function requireSuperAdmin(): Promise<void> {
  await requireRole("SUPER_ADMIN");
}

/* ------------------------------ Applications ----------------------------- */

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

/* ------------------------------ Student admin ---------------------------- */

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

/* ----------------------------- Instructor admin -------------------------- */

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

/* --------------------------------- Users --------------------------------- */

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

/* --------------------------- Academic structure -------------------------- */

function revalidateCatalog(): void {
  revalidateAdmin([
    "/admin/departments",
    "/admin/programs",
    "/admin/courses",
    "/admin/semesters",
    "/admin/course-sections",
    "/admin/student-sections",
    "/admin/enrollments",
  ]);
}

export async function saveDepartmentAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireAdmin();

  const parsed = departmentSchema.safeParse({
    name: readString(formData.get("name")),
    code: readString(formData.get("code")),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the details below and try again.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const isEdit = readString(formData.get("mode")) === "edit";
  const departmentId = readString(formData.get("departmentId"));
  if (isEdit && !departmentId) {
    return { ok: false, message: "Missing department reference." };
  }

  try {
    await serverFetchData(
      isEdit
        ? `${endpoints.departments}/${departmentId}`
        : endpoints.departments,
      { method: isEdit ? "PATCH" : "POST", body: parsed.data },
    );
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(error, "We could not save this department."),
    };
  }

  revalidateCatalog();
  return {
    ok: true,
    message: isEdit ? "Department updated" : "Department created",
    data: null,
  };
}

export async function deleteDepartmentAction(
  departmentId: string,
): Promise<ActionResult<null>> {
  await requireAdmin();

  if (!departmentId) {
    return { ok: false, message: "Missing department reference." };
  }

  try {
    await serverFetchData(`${endpoints.departments}/${departmentId}`, {
      method: "DELETE",
    });
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(
        error,
        "We could not delete this department. Please try again.",
      ),
    };
  }

  revalidateCatalog();
  revalidateAdmin(["/admin/instructors", "/admin/users", "/admin"]);
  return { ok: true, message: "Department deleted", data: null };
}

export async function saveProgramAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireAdmin();

  const parsed = programSchema.safeParse({
    name: readString(formData.get("name")),
    degreeType: readString(formData.get("degreeType")),
    totalCredits: readString(formData.get("totalCredits")),
    departmentId: readString(formData.get("departmentId")),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the details below and try again.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const isEdit = readString(formData.get("mode")) === "edit";
  const programId = readString(formData.get("programId"));
  if (isEdit && !programId) {
    return { ok: false, message: "Missing program reference." };
  }

  try {
    await serverFetchData(
      isEdit ? `${endpoints.programs}/${programId}` : endpoints.programs,
      { method: isEdit ? "PATCH" : "POST", body: parsed.data },
    );
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(error, "We could not save this program."),
    };
  }

  revalidateCatalog();
  return {
    ok: true,
    message: isEdit ? "Program updated" : "Program created",
    data: null,
  };
}

export async function deleteProgramAction(
  programId: string,
): Promise<ActionResult<null>> {
  await requireAdmin();

  if (!programId) {
    return { ok: false, message: "Missing program reference." };
  }

  try {
    await serverFetchData(`${endpoints.programs}/${programId}`, {
      method: "DELETE",
    });
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(
        error,
        "We could not delete this program. Please try again.",
      ),
    };
  }

  revalidateCatalog();
  revalidateAdmin(["/admin/students", "/admin/student-applications", "/admin"]);
  return { ok: true, message: "Program deleted", data: null };
}

export async function saveCourseAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireAdmin();

  const parsed = courseSchema.safeParse({
    code: readString(formData.get("code")),
    title: readString(formData.get("title")),
    creditHours: readString(formData.get("creditHours")),
    departmentId: readString(formData.get("departmentId")),
    prerequisiteIds: formData
      .getAll("prerequisiteIds")
      .map(readString)
      .filter(Boolean),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the details below and try again.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const isEdit = readString(formData.get("mode")) === "edit";
  const courseId = readString(formData.get("courseId"));
  if (isEdit && !courseId) {
    return { ok: false, message: "Missing course reference." };
  }

  try {
    await serverFetchData(
      isEdit ? `${endpoints.courses}/${courseId}` : endpoints.courses,
      { method: isEdit ? "PATCH" : "POST", body: parsed.data },
    );
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(error, "We could not save this course."),
    };
  }

  revalidateCatalog();
  return {
    ok: true,
    message: isEdit ? "Course updated" : "Course created",
    data: null,
  };
}

export async function deleteCourseAction(
  courseId: string,
): Promise<ActionResult<null>> {
  await requireAdmin();

  if (!courseId) {
    return { ok: false, message: "Missing course reference." };
  }

  try {
    await serverFetchData(`${endpoints.courses}/${courseId}`, {
      method: "DELETE",
    });
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(
        error,
        "We could not delete this course. Please try again.",
      ),
    };
  }

  revalidateCatalog();
  revalidateAdmin(["/admin", "/admin/exams", "/admin/results"]);
  return { ok: true, message: "Course deleted", data: null };
}

export async function saveSemesterAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireAdmin();

  const parsed = semesterSchema.safeParse({
    name: readString(formData.get("name")),
    year: readString(formData.get("year")),
    startDate: readString(formData.get("startDate")),
    endDate: readString(formData.get("endDate")),
    registrationDeadline:
      readString(formData.get("registrationDeadline")) || "",
    isActive: formData.get("isActive") === "true",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the details below and try again.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const body = {
    name: parsed.data.name,
    year: parsed.data.year,
    startDate: toIsoDate(parsed.data.startDate),
    endDate: toIsoDate(parsed.data.endDate),
    registrationDeadline: parsed.data.registrationDeadline
      ? toIsoDate(parsed.data.registrationDeadline)
      : undefined,
    isActive: parsed.data.isActive,
  };

  const isEdit = readString(formData.get("mode")) === "edit";
  const semesterId = readString(formData.get("semesterId"));
  if (isEdit && !semesterId) {
    return { ok: false, message: "Missing semester reference." };
  }

  try {
    await serverFetchData(
      isEdit ? `${endpoints.semesters}/${semesterId}` : endpoints.semesters,
      { method: isEdit ? "PATCH" : "POST", body },
    );
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(error, "We could not save this semester."),
    };
  }

  revalidateCatalog();
  revalidateAdmin(["/admin", "/admin/analytics"]);
  return {
    ok: true,
    message: isEdit ? "Semester updated" : "Semester created",
    data: null,
  };
}

export async function deleteSemesterAction(
  semesterId: string,
): Promise<ActionResult<null>> {
  await requireAdmin();

  if (!semesterId) {
    return { ok: false, message: "Missing semester reference." };
  }

  try {
    await serverFetchData(`${endpoints.semesters}/${semesterId}`, {
      method: "DELETE",
    });
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(
        error,
        "We could not delete this semester. Please try again.",
      ),
    };
  }

  revalidateCatalog();
  revalidateAdmin(["/admin", "/admin/analytics"]);
  return { ok: true, message: "Semester deleted", data: null };
}

export async function saveCourseSectionAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireAdmin();

  const isEdit = readString(formData.get("mode")) === "edit";
  const sectionId = readString(formData.get("sectionId"));
  if (isEdit && !sectionId) {
    return { ok: false, message: "Missing section reference." };
  }

  try {
    if (isEdit) {
      const parsed = courseSectionUpdateSchema.safeParse({
        sectionCode: readString(formData.get("sectionCode")),
        instructorId: readString(formData.get("instructorId")),
        capacity: readString(formData.get("capacity")),
        schedule: readString(formData.get("schedule")),
      });
      if (!parsed.success) {
        return {
          ok: false,
          message: "Check the details below and try again.",
          fieldErrors: fieldErrorsFrom(parsed.error),
        };
      }
      await serverFetchData(`${endpoints.courseSections}/${sectionId}`, {
        method: "PATCH",
        body: {
          sectionCode: parsed.data.sectionCode,
          instructorId: parsed.data.instructorId || null,
          capacity: parsed.data.capacity,
          schedule: parsed.data.schedule,
        },
      });
    } else {
      const parsed = courseSectionCreateSchema.safeParse({
        courseId: readString(formData.get("courseId")),
        semesterId: readString(formData.get("semesterId")),
        sectionCode: readString(formData.get("sectionCode")),
        instructorId: readString(formData.get("instructorId")),
        capacity: readString(formData.get("capacity")),
        schedule: readString(formData.get("schedule")),
      });
      if (!parsed.success) {
        return {
          ok: false,
          message: "Check the details below and try again.",
          fieldErrors: fieldErrorsFrom(parsed.error),
        };
      }
      await serverFetchData(endpoints.courseSections, {
        method: "POST",
        body: {
          courseId: parsed.data.courseId,
          semesterId: parsed.data.semesterId,
          sectionCode: parsed.data.sectionCode,
          instructorId: parsed.data.instructorId || undefined,
          capacity: parsed.data.capacity,
          schedule: parsed.data.schedule,
        },
      });
    }
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(error, "We could not save this section."),
    };
  }

  revalidateCatalog();
  revalidateAdmin(["/admin/instructors", "/admin/exams", "/admin/results"]);
  return {
    ok: true,
    message: isEdit ? "Section updated" : "Section created",
    data: null,
  };
}

export async function deleteCourseSectionAction(
  sectionId: string,
): Promise<ActionResult<null>> {
  await requireAdmin();

  if (!sectionId) {
    return { ok: false, message: "Missing section reference." };
  }

  try {
    await serverFetchData(`${endpoints.courseSections}/${sectionId}`, {
      method: "DELETE",
    });
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(
        error,
        "We could not delete this section. Please try again.",
      ),
    };
  }

  revalidateCatalog();
  revalidateAdmin(["/admin/exams", "/admin/results"]);
  return { ok: true, message: "Section deleted", data: null };
}

export async function saveStudentSectionAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireAdmin();

  const isEdit = readString(formData.get("mode")) === "edit";
  const sectionId = readString(formData.get("sectionId"));
  if (isEdit && !sectionId) {
    return { ok: false, message: "Missing section reference." };
  }

  try {
    if (isEdit) {
      const parsed = studentSectionUpdateSchema.safeParse({
        sectionCode: readString(formData.get("sectionCode")),
        capacity: readString(formData.get("capacity")),
      });
      if (!parsed.success) {
        return {
          ok: false,
          message: "Check the details below and try again.",
          fieldErrors: fieldErrorsFrom(parsed.error),
        };
      }
      await serverFetchData(`${endpoints.studentSections}/${sectionId}`, {
        method: "PATCH",
        body: parsed.data,
      });
    } else {
      const parsed = studentSectionCreateSchema.safeParse({
        sectionCode: readString(formData.get("sectionCode")),
        programId: readString(formData.get("programId")),
        enrollmentYear: readString(formData.get("enrollmentYear")),
        capacity: readString(formData.get("capacity")),
      });
      if (!parsed.success) {
        return {
          ok: false,
          message: "Check the details below and try again.",
          fieldErrors: fieldErrorsFrom(parsed.error),
        };
      }
      await serverFetchData(endpoints.studentSections, {
        method: "POST",
        body: parsed.data,
      });
    }
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(error, "We could not save this section."),
    };
  }

  revalidateCatalog();
  revalidateAdmin(["/admin/students", "/admin/student-applications"]);
  return {
    ok: true,
    message: isEdit ? "Section updated" : "Section created",
    data: null,
  };
}

export async function deleteStudentSectionAction(
  sectionId: string,
): Promise<ActionResult<null>> {
  await requireAdmin();

  if (!sectionId) {
    return { ok: false, message: "Missing section reference." };
  }

  try {
    await serverFetchData(`${endpoints.studentSections}/${sectionId}`, {
      method: "DELETE",
    });
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(
        error,
        "We could not delete this section. Please try again.",
      ),
    };
  }

  revalidateCatalog();
  revalidateAdmin(["/admin/students"]);
  return { ok: true, message: "Section deleted", data: null };
}

/* ------------------------------- Operations ------------------------------ */

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

/* --------------------------- Exam/result oversight ------------------------ */

const NON_EMPTY_MARKS = (value: FormDataEntryValue | null): value is string =>
  typeof value === "string" && value.trim() !== "";

export async function adminSaveExamAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  await requireAdmin();

  const parsed = examSchema.safeParse({
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

  const isEdit = readString(formData.get("mode")) === "edit";
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
