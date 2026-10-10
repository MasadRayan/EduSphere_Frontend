import { GraduationCap } from "lucide-react";
import { Suspense } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { TablePagination } from "@/components/shared/table-pagination";
import { getSession } from "@/lib/auth/session";
import { isCatalogGated } from "@/lib/catalog/gate";
import { listDepartments, listPrograms } from "@/lib/catalog/service";
import { CatalogFilters } from "./catalog-filters";
import { CatalogGate } from "./catalog-gate";
import { CatalogListSkeleton } from "./catalog-skeleton";
import { ProgramCard } from "./program-card";

export interface CatalogSearchParams {
  departmentId?: string;
  searchTerm?: string;
  page?: string;
}

function parsePage(value?: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

export async function ProgramsSection({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  const session = await getSession();
  if (!session) {
    return <CatalogGate nextPath="/programs" what="Programs" />;
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
          searchPlaceholder="Search programs"
        />
      </Suspense>

      <Suspense
        key={`${departmentId ?? "all"}-${searchTerm ?? ""}-${page}`}
        fallback={<CatalogListSkeleton />}
      >
        <ProgramsList
          departmentId={departmentId}
          searchTerm={searchTerm}
          page={page}
        />
      </Suspense>
    </div>
  );
}

async function ProgramsList({
  departmentId,
  searchTerm,
  page,
}: {
  departmentId?: string;
  searchTerm?: string;
  page: number;
}) {
  let result: Awaited<ReturnType<typeof listPrograms>>;
  try {
    result = await listPrograms({ departmentId, searchTerm, page });
  } catch (error) {
    if (isCatalogGated(error)) {
      return <CatalogGate nextPath="/programs" what="Programs" />;
    }
    throw error;
  }

  if (result.data.length === 0) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="No programs found"
        description="Try a different department or clear your search."
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {result.data.map((program) => (
          <ProgramCard key={program.id} program={program} />
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
