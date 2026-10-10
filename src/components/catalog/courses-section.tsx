import { BookOpen } from "lucide-react";
import { Suspense } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { TablePagination } from "@/components/shared/table-pagination";
import { getSession } from "@/lib/auth/session";
import { isCatalogGated } from "@/lib/catalog/gate";
import { listCourses, listDepartments } from "@/lib/catalog/service";
import { CatalogFilters } from "./catalog-filters";
import { CatalogGate } from "./catalog-gate";
import { CatalogListSkeleton } from "./catalog-skeleton";
import { CourseCard } from "./course-card";
import type { CatalogSearchParams } from "./programs-section";

function parsePage(value?: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

export async function CoursesSection({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  const session = await getSession();
  if (!session) {
    return <CatalogGate nextPath="/courses" what="Courses" />;
  }

  const params = await searchParams;
  const departmentId = params.departmentId;
  const searchTerm = params.searchTerm?.trim() || undefined;
  const page = parsePage(params.page);

  const departments = await listDepartments();

  return (
    <div className="space-y-8">
      <Suspense fallback={null}>
        <CatalogFilters
          departments={departments.data}
          searchPlaceholder="Search courses by code or title"
        />
      </Suspense>

      <Suspense
        key={`${departmentId ?? "all"}-${searchTerm ?? ""}-${page}`}
        fallback={<CatalogListSkeleton />}
      >
        <CoursesList
          departmentId={departmentId}
          searchTerm={searchTerm}
          page={page}
        />
      </Suspense>
    </div>
  );
}

async function CoursesList({
  departmentId,
  searchTerm,
  page,
}: {
  departmentId?: string;
  searchTerm?: string;
  page: number;
}) {
  let result: Awaited<ReturnType<typeof listCourses>>;
  try {
    result = await listCourses({ departmentId, searchTerm, page });
  } catch (error) {
    if (isCatalogGated(error)) {
      return <CatalogGate nextPath="/courses" what="Courses" />;
    }
    throw error;
  }

  if (result.data.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No courses found"
        description="Try a different department or clear your search."
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {result.data.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
      <TablePagination
        page={result.meta.page}
        totalPages={result.meta.totalPages}
        total={result.meta.total}
      />
    </div>
  );
}
