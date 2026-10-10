import "server-only";
import { endpoints } from "@/lib/api/endpoints";
import { serverFetch, serverFetchData } from "@/lib/api/server-fetch";
import type { PaginationMeta, PaymentsMeta } from "@/types/api";
import type {
  AttendanceGroup,
  CgpaResult,
  Course,
  CourseGrade,
  CourseRegistration,
  CourseSection,
  GradeDetail,
  Payment,
  Semester,
  SemesterEnrollment,
  StudentAnalytics,
  StudentApplication,
  StudentMe,
} from "@/types/entities";

export interface StudentPage<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaymentPage {
  data: Payment[];
  meta: PaymentsMeta;
}

export interface EnrollmentQuery {
  status?: string;
  semesterId?: string;
  page?: number;
  limit?: number;
}

export interface PaymentQuery {
  status?: string;
  purpose?: string;
  semesterId?: string;
  page?: number;
  limit?: number;
}

export interface AnalyticsQuery {
  semesterId?: string;
  startDate?: string;
  endDate?: string;
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

function normalizePage<T>(data: T[], meta?: PaginationMeta): StudentPage<T> {
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

// Personal reads never pass cache tags: the endpoints are identical per user
// and are served dynamically so one student never sees another student's data.
export function getStudentMe(): Promise<StudentMe> {
  return serverFetchData<StudentMe>(endpoints.student.me);
}

export function getMyApplication(): Promise<StudentApplication | null> {
  return serverFetchData<StudentApplication | null>(
    endpoints.student.application,
  );
}

export function getRegisteredCourses(): Promise<CourseRegistration[]> {
  return serverFetchData<CourseRegistration[]>(
    endpoints.student.registeredCourses,
  );
}

export function getRegisteredCourseDetail(
  id: string,
): Promise<CourseRegistration> {
  return serverFetchData<CourseRegistration>(
    `${endpoints.student.registeredCourses}/${id}`,
  );
}

export function getAttendance(): Promise<AttendanceGroup[]> {
  return serverFetchData<AttendanceGroup[]>(endpoints.student.attendance);
}

export function getGrades(): Promise<CourseGrade[]> {
  return serverFetchData<CourseGrade[]>(endpoints.student.grades);
}

export function getGradeDetail(id: string): Promise<GradeDetail> {
  return serverFetchData<GradeDetail>(`${endpoints.student.grades}/${id}`);
}

export function getCgpa(): Promise<CgpaResult> {
  return serverFetchData<CgpaResult>(endpoints.student.cgpa);
}

export async function getMyEnrollments(
  params: EnrollmentQuery = {},
): Promise<StudentPage<SemesterEnrollment>> {
  const envelope = await serverFetch<SemesterEnrollment[]>(
    endpoints.courseRegistrations.mine,
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

export async function getMyPayments(
  params: PaymentQuery = {},
): Promise<PaymentPage> {
  const envelope = await serverFetch<Payment[]>(endpoints.payments.mine, {
    query: toQuery({
      status: params.status,
      purpose: params.purpose,
      semesterId: params.semesterId,
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

export function getStudentAnalytics(
  params: AnalyticsQuery = {},
): Promise<StudentAnalytics> {
  return serverFetchData<StudentAnalytics>(endpoints.analytics.student, {
    query: toQuery({
      semesterId: params.semesterId,
      startDate: params.startDate,
      endDate: params.endDate,
    }),
  });
}

export async function listSemesters(): Promise<Semester[]> {
  const envelope = await serverFetch<Semester[]>(endpoints.semesters, {
    query: { limit: "100" },
  });
  return envelope.data;
}

export async function listOfferedSections(
  semesterId: string,
): Promise<CourseSection[]> {
  const envelope = await serverFetch<CourseSection[]>(
    endpoints.courseSections,
    {
      query: { semesterId, limit: "100" },
    },
  );
  return envelope.data;
}

export async function getActiveSemester(): Promise<Semester | null> {
  const envelope = await serverFetch<Semester[]>(endpoints.semesters, {
    query: { isActive: "true", limit: "1" },
  });
  return envelope.data[0] ?? null;
}

export async function listEnrollCourses(): Promise<Course[]> {
  const envelope = await serverFetch<Course[]>(endpoints.courses, {
    query: { limit: "100" },
  });
  return envelope.data;
}
