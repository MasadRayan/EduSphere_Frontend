import "server-only";
import { revalidatePath, updateTag } from "next/cache";
import { requireRole } from "@/lib/auth/roles";

/**
 * Shared role guards for admin server actions. Every action re-checks the
 * session itself; wrong roles land on their own dashboard like the layout
 * guards do.
 */
export async function requireAdmin(): Promise<void> {
  await requireRole("ADMIN", "SUPER_ADMIN");
}

export async function requireSuperAdmin(): Promise<void> {
  await requireRole("SUPER_ADMIN");
}

export function revalidateAdmin(paths: string[]): void {
  for (const path of paths) {
    revalidatePath(path);
  }
}

export function toIsoDate(date: string): string {
  return `${date}T00:00:00.000Z`;
}

const ADMIN_CATALOG_PATHS = [
  "/admin/departments",
  "/admin/programs",
  "/admin/courses",
  "/admin/semesters",
  "/admin/course-sections",
  "/admin/student-sections",
  "/admin/enrollments",
];

/**
 * Public pages that render catalog data. Dynamic route patterns take the
 * "page" type so revalidatePath targets the real page instead of warning.
 */
const PUBLIC_CATALOG_PATHS = [
  "/",
  "/courses",
  "/courses/[id]",
  "/programs",
  "/programs/[id]",
];

/**
 * Refreshes the admin catalog screens and the public catalog pages after an
 * edit, and expires the cache tags the edited entity belongs to. The acting
 * admin sees the change immediately; other visitors pick it up when their
 * private cache stale window lapses.
 */
export function revalidateCatalog(tags: string[] = []): void {
  revalidateAdmin(ADMIN_CATALOG_PATHS);
  for (const path of PUBLIC_CATALOG_PATHS) {
    revalidatePath(path, "page");
  }
  for (const tag of tags) {
    updateTag(tag);
  }
}
