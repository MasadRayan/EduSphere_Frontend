import "server-only";
import { endpoints } from "@/lib/api/endpoints";
import { serverFetch, serverFetchData } from "@/lib/api/server-fetch";
import type { PaginationMeta } from "@/types/api";
import type { Course, Department, Program, Semester } from "@/types/entities";

export interface CatalogListParams {
  departmentId?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
}

export interface CatalogPage<T> {
  data: T[];
  meta: PaginationMeta;
}

const DEFAULT_LIMIT = 12;

function toQuery(params: CatalogListParams): Record<string, string> {
  const query: Record<string, string> = {
    page: String(params.page ?? 1),
    limit: String(params.limit ?? DEFAULT_LIMIT),
  };
  if (params.departmentId) {
    query.departmentId = params.departmentId;
  }
  if (params.searchTerm) {
    query.searchTerm = params.searchTerm;
  }
  return query;
}

function normalizePage<T>(data: T[], meta?: PaginationMeta): CatalogPage<T> {
  const page = meta?.page ?? 1;
  const limit = meta?.limit ?? data.length;
  return {
    data,
    meta: {
      page,
      limit,
      total: meta?.total ?? data.length,
      totalPages: meta?.totalPages ?? 1,
    },
  };
}

export async function listDepartments(
  params: CatalogListParams = {},
): Promise<CatalogPage<Department>> {
  const envelope = await serverFetch<Department[]>(endpoints.departments, {
    query: toQuery({ ...params, limit: params.limit ?? 100 }),
    next: { tags: ["departments"] },
  });
  return normalizePage(envelope.data, envelope.meta as PaginationMeta);
}

export async function listPrograms(
  params: CatalogListParams = {},
): Promise<CatalogPage<Program>> {
  const envelope = await serverFetch<Program[]>(endpoints.programs, {
    query: toQuery(params),
    next: { tags: ["programs"] },
  });
  return normalizePage(envelope.data, envelope.meta as PaginationMeta);
}

export async function getProgram(id: string): Promise<Program> {
  return serverFetchData<Program>(`${endpoints.programs}/${id}`, {
    next: { tags: ["programs", `program-${id}`] },
  });
}

export async function listCourses(
  params: CatalogListParams = {},
): Promise<CatalogPage<Course>> {
  const envelope = await serverFetch<Course[]>(endpoints.courses, {
    query: toQuery(params),
    next: { tags: ["courses"] },
  });
  return normalizePage(envelope.data, envelope.meta as PaginationMeta);
}

export async function getCourse(id: string): Promise<Course> {
  return serverFetchData<Course>(`${endpoints.courses}/${id}`, {
    next: { tags: ["courses", `course-${id}`] },
  });
}

export async function listSemesters(): Promise<Semester[]> {
  const envelope = await serverFetch<Semester[]>(endpoints.semesters, {
    query: { limit: "100" },
    next: { tags: ["semesters"] },
  });
  return envelope.data;
}
