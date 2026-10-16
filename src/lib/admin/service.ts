import "server-only";
import { endpoints } from "@/lib/api/endpoints";
import { serverFetch, serverFetchData } from "@/lib/api/server-fetch";
import type { PaginationMeta, PaymentsMeta } from "@/types/api";
import type {
  AdminAnalytics,
  AdminSemester,
  AdminUserRow,
  Course,
  CourseSection,
  InstructorAdminRow,
  InstructorApplication,
  InstructorExam,
  Payment,
  SemesterEnrollment,
  StudentApplication,
  StudentSectionAdmin,
} from "@/types/entities";

export interface AdminPage<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface AdminListParams {
  searchTerm?: string;
  page?: number;
  limit?: number;
}

function toQuery(params: Record<string, string | number | undefined>) {
  const query: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      query[key] = String(value);
    }
  }
  return query;
}

function normalizePage<T>(data: T[], meta?: PaginationMeta): AdminPage<T> {
  return {
    data,
    meta: {
      page: meta?.page ?? 1,
      limit: meta?.limit ?? data.length,
      total: meta?.total ?? data.length,
      totalPages: meta?.totalPages ?? 1,
    },
  };
}

export function getAdminAnalytics(
  params: { semesterId?: string; startDate?: string; endDate?: string } = {},
): Promise<AdminAnalytics> {
  return serverFetchData<AdminAnalytics>(endpoints.analytics.admin, {
    query: toQuery({
      semesterId: params.semesterId,
      startDate: params.startDate,
      endDate: params.endDate,
    }),
  });
}

export function listStudentApplications(
  status?: string,
): Promise<StudentApplication[]> {
  return serverFetchData<StudentApplication[]>(endpoints.student.applications, {
    query: toQuery({ status }),
  });
}

export function listInstructorApplications(
  status?: string,
): Promise<InstructorApplication[]> {
  return serverFetchData<InstructorApplication[]>(
    endpoints.instructor.applications,
    { query: toQuery({ status }) },
  );
}

export async function listUsers(params: {
  role?: string;
  status?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
}): Promise<AdminPage<AdminUserRow>> {
  const envelope = await serverFetch<AdminUserRow[]>(endpoints.users, {
    query: toQuery({
      role: params.role,
      status: params.status,
      searchTerm: params.searchTerm,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
    }),
  });
  return normalizePage(envelope.data, envelope.meta as PaginationMeta);
}

export async function listInstructors(
  params: AdminListParams & { departmentId?: string },
): Promise<AdminPage<InstructorAdminRow>> {
  const envelope = await serverFetch<InstructorAdminRow[]>(
    endpoints.instructor.list,
    {
      query: toQuery({
        searchTerm: params.searchTerm,
        departmentId: params.departmentId,
        page: params.page ?? 1,
        limit: params.limit ?? 10,
      }),
    },
  );
  return normalizePage(envelope.data, envelope.meta as PaginationMeta);
}

export async function listAllCourseSections(params: {
  courseId?: string;
  semesterId?: string;
  page?: number;
  limit?: number;
}): Promise<AdminPage<CourseSection>> {
  const envelope = await serverFetch<CourseSection[]>(
    endpoints.courseSections,
    {
      query: toQuery({
        courseId: params.courseId,
        semesterId: params.semesterId,
        page: params.page ?? 1,
        limit: params.limit ?? 10,
      }),
    },
  );
  return normalizePage(envelope.data, envelope.meta as PaginationMeta);
}

export async function listAllStudentSections(params: {
  programId?: string;
  enrollmentYear?: string;
  page?: number;
  limit?: number;
}): Promise<AdminPage<StudentSectionAdmin>> {
  const envelope = await serverFetch<StudentSectionAdmin[]>(
    endpoints.studentSections,
    {
      query: toQuery({
        programId: params.programId,
        enrollmentYear: params.enrollmentYear,
        page: params.page ?? 1,
        limit: params.limit ?? 10,
      }),
    },
  );
  return normalizePage(envelope.data, envelope.meta as PaginationMeta);
}

export async function listAllRegistrations(params: {
  status?: string;
  semesterId?: string;
  page?: number;
  limit?: number;
}): Promise<AdminPage<SemesterEnrollment>> {
  const envelope = await serverFetch<SemesterEnrollment[]>(
    endpoints.courseRegistrations.base,
    {
      query: toQuery({
        status: params.status,
        semesterId: params.semesterId,
        page: params.page ?? 1,
        limit: params.limit ?? 10,
      }),
    },
  );
  return normalizePage(envelope.data, envelope.meta as PaginationMeta);
}

export async function listAllPayments(params: {
  status?: string;
  purpose?: string;
  semesterId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: Payment[]; meta: PaymentsMeta }> {
  const envelope = await serverFetch<Payment[]>(endpoints.payments.base, {
    query: toQuery({
      status: params.status,
      purpose: params.purpose,
      semesterId: params.semesterId,
      startDate: params.startDate,
      endDate: params.endDate,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
    }),
  });
  const meta = envelope.meta as PaymentsMeta | undefined;
  return {
    data: envelope.data,
    meta: {
      page: meta?.page ?? 1,
      limit: meta?.limit ?? envelope.data.length,
      total: meta?.total ?? envelope.data.length,
      totalPages: meta?.totalPages ?? 1,
      summary: meta?.summary ?? { revenue: 0, refunded: 0 },
    },
  };
}

export async function listAllExams(
  courseSectionId?: string,
  page?: number,
): Promise<AdminPage<InstructorExam>> {
  const envelope = await serverFetch<InstructorExam[]>(endpoints.exams, {
    query: toQuery({ courseSectionId, page: page ?? 1, limit: 100 }),
  });
  return normalizePage(envelope.data, envelope.meta as PaginationMeta);
}

export async function listAllSemesters(params: {
  year?: string;
  page?: number;
  limit?: number;
}): Promise<AdminPage<AdminSemester>> {
  const envelope = await serverFetch<AdminSemester[]>(endpoints.semesters, {
    query: toQuery({
      year: params.year,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
    }),
  });
  return normalizePage(envelope.data, envelope.meta as PaginationMeta);
}

export async function listAllCourses(params: {
  departmentId?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
}): Promise<AdminPage<Course>> {
  const envelope = await serverFetch<Course[]>(endpoints.courses, {
    query: toQuery({
      departmentId: params.departmentId,
      searchTerm: params.searchTerm,
      page: params.page ?? 1,
      limit: params.limit ?? 100,
    }),
  });
  return normalizePage(envelope.data, envelope.meta as PaginationMeta);
}
