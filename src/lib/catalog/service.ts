import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { endpoints } from "@/lib/api/endpoints";
import { serverFetch, serverFetchData } from "@/lib/api/server-fetch";
import { TAGS } from "@/lib/cache/tags";
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

/**
 * Catalog reads are cached per user with the built-in private cache. The
 * catalog changes only when an admin edits it, so a short stale window keeps
 * navigation instant without ever blocking on stale academic data. Filtered
 * or searched list reads stay uncached because every filter combination would
 * become its own cache entry.
 */
const CATALOG_STALE_SECONDS = 300;

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

function isFiltered(params: CatalogListParams): boolean {
  return Boolean(params.searchTerm || params.departmentId);
}

async function fetchDepartments(
  params: CatalogListParams,
): Promise<CatalogPage<Department>> {
  const envelope = await serverFetch<Department[]>(endpoints.departments, {
    query: toQuery({ ...params, limit: params.limit ?? 100 }),
  });
  return normalizePage(envelope.data, envelope.meta as PaginationMeta);
}

export async function listDepartments(
  params: CatalogListParams = {},
): Promise<CatalogPage<Department>> {
  "use cache: private";
  cacheTag(TAGS.departments);
  cacheLife({ stale: CATALOG_STALE_SECONDS });
  return fetchDepartments(params);
}

async function fetchPrograms(
  params: CatalogListParams,
): Promise<CatalogPage<Program>> {
  const envelope = await serverFetch<Program[]>(endpoints.programs, {
    query: toQuery(params),
  });
  return normalizePage(envelope.data, envelope.meta as PaginationMeta);
}

async function cachedPrograms(
  params: CatalogListParams,
): Promise<CatalogPage<Program>> {
  "use cache: private";
  cacheTag(TAGS.programs);
  cacheLife({ stale: CATALOG_STALE_SECONDS });
  return fetchPrograms(params);
}

export async function listPrograms(
  params: CatalogListParams = {},
): Promise<CatalogPage<Program>> {
  if (isFiltered(params)) {
    return fetchPrograms(params);
  }
  return cachedPrograms(params);
}

export async function getProgram(id: string): Promise<Program> {
  "use cache: private";
  cacheTag(TAGS.programs, TAGS.program(id));
  cacheLife({ stale: CATALOG_STALE_SECONDS });
  return serverFetchData<Program>(`${endpoints.programs}/${id}`);
}

async function fetchCourses(
  params: CatalogListParams,
): Promise<CatalogPage<Course>> {
  const envelope = await serverFetch<Course[]>(endpoints.courses, {
    query: toQuery(params),
  });
  return normalizePage(envelope.data, envelope.meta as PaginationMeta);
}

async function cachedCourses(
  params: CatalogListParams,
): Promise<CatalogPage<Course>> {
  "use cache: private";
  cacheTag(TAGS.courses);
  cacheLife({ stale: CATALOG_STALE_SECONDS });
  return fetchCourses(params);
}

export async function listCourses(
  params: CatalogListParams = {},
): Promise<CatalogPage<Course>> {
  if (isFiltered(params)) {
    return fetchCourses(params);
  }
  return cachedCourses(params);
}

export async function getCourse(id: string): Promise<Course> {
  "use cache: private";
  cacheTag(TAGS.courses, TAGS.course(id));
  cacheLife({ stale: CATALOG_STALE_SECONDS });
  return serverFetchData<Course>(`${endpoints.courses}/${id}`);
}

export async function listSemesters(): Promise<Semester[]> {
  "use cache: private";
  cacheTag(TAGS.semesters);
  cacheLife({ stale: CATALOG_STALE_SECONDS });
  const envelope = await serverFetch<Semester[]>(endpoints.semesters, {
    query: { limit: "100" },
  });
  return envelope.data;
}
