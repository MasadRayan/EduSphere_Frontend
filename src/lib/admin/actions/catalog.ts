"use server";

import type { FormState } from "@/lib/actions/shared";
import { fieldErrorsFrom, messageFrom, readString } from "@/lib/actions/shared";
import {
  courseSchema,
  courseSectionCreateSchema,
  courseSectionUpdateSchema,
  departmentSchema,
  programSchema,
  semesterSchema,
  studentSectionCreateSchema,
  studentSectionUpdateSchema,
} from "@/lib/admin/schemas";
import { endpoints } from "@/lib/api/endpoints";
import { serverFetchData } from "@/lib/api/server-fetch";
import { TAGS } from "@/lib/cache/tags";
import type { ActionResult } from "@/types/api";
import {
  requireAdmin,
  revalidateAdmin,
  revalidateCatalog,
  toIsoDate,
} from "./shared";

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

  revalidateCatalog([TAGS.departments]);
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

  revalidateCatalog([TAGS.departments]);
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

  revalidateCatalog(
    isEdit ? [TAGS.programs, TAGS.program(programId)] : [TAGS.programs],
  );
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

  revalidateCatalog([TAGS.programs, TAGS.program(programId)]);
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

  revalidateCatalog(
    isEdit ? [TAGS.courses, TAGS.course(courseId)] : [TAGS.courses],
  );
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

  revalidateCatalog([TAGS.courses, TAGS.course(courseId)]);
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

  revalidateCatalog([TAGS.semesters]);
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

  revalidateCatalog([TAGS.semesters]);
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

  revalidateCatalog([TAGS.courses, TAGS.semesters]);
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

  revalidateCatalog([TAGS.courses, TAGS.semesters]);
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
