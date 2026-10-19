import { BookOpen, Info } from "lucide-react";
import { type ReactNode, Suspense } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { TablePagination } from "@/components/shared/table-pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getSession } from "@/lib/auth/session";
import { isCatalogGated } from "@/lib/catalog/gate";
import { listCourses, listDepartments } from "@/lib/catalog/service";
import {
  getActiveSemester,
  getMyEnrollments,
  getRegisteredCourses,
  listOfferedSections,
} from "@/lib/student/service";
import { CatalogFilters } from "./catalog-filters";
import { CatalogGate } from "./catalog-gate";
import { CatalogListSkeleton } from "./catalog-skeleton";
import { CourseCard, type CourseCardStatus } from "./course-card";
import {
  CourseSelectionBar,
  CourseSelectionProvider,
} from "./course-selection";
import type { CatalogSearchParams } from "./programs-section";

function parsePage(value?: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

interface SelectionPlan {
  selectable: boolean;
  /** Course id -> state for courses the student already holds. */
  states: Map<string, CourseCardStatus>;
  /** Course ids with at least one offered section; null when unknown. */
  offered: Set<string> | null;
  notice: ReactNode;
}

function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Alert>
      <Info className="size-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

/**
 * Decides whether the catalog can be ticked, and prepares the per-course state
 * so a student never picks a course the enroll step would silently drop.
 *
 * Only approved students with an open registration window can select. Everyone
 * else (including students waiting on approval or already enrolled for the
 * semester) keeps the browse-only catalog. A failed read degrades to browse
 * rather than breaking the page; the enroll picker re-checks everything.
 */
async function getSelectionPlan(
  session: NonNullable<Awaited<ReturnType<typeof getSession>>>,
): Promise<SelectionPlan> {
  const browse = (notice: ReactNode = null): SelectionPlan => ({
    selectable: false,
    states: new Map(),
    offered: null,
    notice,
  });

  if (session.role !== "STUDENT" || !session.studentProfile) {
    return browse();
  }

  try {
    const semester = await getActiveSemester();
    if (!semester) {
      return browse(
        <Notice title="Registration is not open">
          There is no active enrollment period right now. Browse the catalog and
          check back once the registrar opens a new semester.
        </Notice>,
      );
    }

    const [registrations, enrollments, sections] = await Promise.all([
      getRegisteredCourses(),
      getMyEnrollments({ semesterId: semester.id, limit: 10 }),
      listOfferedSections(semester.id),
    ]);

    const activeEnrollment = enrollments.data.find((enrollment) =>
      ["PENDING", "ENROLLED"].includes(enrollment.status as string),
    );
    if (activeEnrollment) {
      return browse(
        <Notice title="You are already enrolled">
          You already have an enrollment for {semester.name}, so you cannot
          start another one. Open My enrollments to review or cancel it.
        </Notice>,
      );
    }

    const states = new Map<string, CourseCardStatus>();
    for (const registration of registrations) {
      const courseId = registration.courseSection.courseId;
      if (registration.status === "COMPLETED") {
        states.set(courseId, "completed");
      } else if (
        registration.status === "ENROLLED" &&
        states.get(courseId) !== "completed"
      ) {
        states.set(courseId, "enrolled");
      }
    }

    return {
      selectable: true,
      states,
      offered: new Set(sections.map((section) => section.courseId)),
      notice: null,
    };
  } catch {
    return browse();
  }
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

  const [departments, plan] = await Promise.all([
    listDepartments(),
    getSelectionPlan(session),
  ]);

  return (
    <CourseSelectionProvider enabled={plan.selectable}>
      <div className="space-y-8">
        {plan.notice}

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
            plan={plan}
          />
        </Suspense>

        <CourseSelectionBar />
      </div>
    </CourseSelectionProvider>
  );
}

async function CoursesList({
  departmentId,
  searchTerm,
  page,
  plan,
}: {
  departmentId?: string;
  searchTerm?: string;
  page: number;
  plan: SelectionPlan;
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
        {result.data.map((course) => {
          if (!plan.selectable) {
            return (
              <CourseCard
                key={course.id}
                course={course}
                selectable={false}
                status={plan.states.get(course.id)}
              />
            );
          }

          const status =
            plan.states.get(course.id) ??
            (plan.offered && !plan.offered.has(course.id)
              ? "not-offered"
              : undefined);

          return (
            <CourseCard
              key={course.id}
              course={course}
              selectable={!status}
              status={status}
            />
          );
        })}
      </div>
      <TablePagination
        page={result.meta.page}
        totalPages={result.meta.totalPages}
        total={result.meta.total}
      />
    </div>
  );
}
