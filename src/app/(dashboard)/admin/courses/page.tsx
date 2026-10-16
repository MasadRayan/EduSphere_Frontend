import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import { CourseFormDialog } from "@/components/admin/course-form-dialog";
import { EntityDeleteButton } from "@/components/admin/entity-delete-button";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { TableFilter } from "@/components/shared/table-filter";
import { TablePagination } from "@/components/shared/table-pagination";
import { TableSearch } from "@/components/shared/table-search";
import { Badge } from "@/components/ui/badge";
import { deleteCourseAction, saveCourseAction } from "@/lib/admin/actions";
import { requireRole } from "@/lib/auth/roles";
import { listCourses, listDepartments } from "@/lib/catalog/service";
import { readPage } from "@/lib/search-params";
import type { Course } from "@/types/entities";

export const metadata: Metadata = { title: "Courses" };

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const params = await searchParams;
  const read = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const searchTerm = read("searchTerm");
  const departmentId = read("departmentId");
  const page = readPage(params.page);

  const [departments, courses] = await Promise.all([
    listDepartments(),
    listCourses({ searchTerm, departmentId, page, limit: 10 }),
  ]);

  const departmentById = new Map(
    departments.data.map((department) => [department.id, department]),
  );
  const departmentOptions = departments.data.map((department) => ({
    value: department.id,
    label: `${department.code} - ${department.name}`,
  }));

  const allCourses = (await listCourses({ limit: 100 })).data;

  const columns: DataTableColumn<Course>[] = [
    {
      id: "course",
      header: "Course",
      cell: (course) => (
        <div className="space-y-0.5">
          <span className="inline-flex w-fit items-center rounded-md border border-border bg-card px-2 py-0.5 font-mono text-xs font-medium tracking-tight text-foreground">
            {course.code}
          </span>
          <p className="max-w-64 truncate text-xs text-muted-foreground">
            {course.title}
          </p>
        </div>
      ),
    },
    {
      id: "credits",
      header: "Credits",
      cell: (course) => <span className="font-mono">{course.creditHours}</span>,
    },
    {
      id: "prerequisites",
      header: "Prerequisites",
      cell: (course) =>
        course.prerequisites && course.prerequisites.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {course.prerequisites.map((entry) => (
              <Badge
                key={entry.id}
                variant="outline"
                className="font-mono text-xs"
              >
                {entry.prerequisite?.code ?? entry.prerequisiteId}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">None</span>
        ),
    },
    {
      id: "department",
      header: "Department",
      cell: (course) => {
        const department =
          course.department ?? departmentById.get(course.departmentId);
        return (
          <span className="text-sm">
            {department
              ? `${department.code} - ${department.name}`
              : course.departmentId}
          </span>
        );
      },
    },
    {
      id: "actions",
      headClassName: "text-right",
      cellClassName: "text-right",
      header: <span className="sr-only">Actions</span>,
      cell: (course) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <CourseFormDialog
            course={course}
            departmentOptions={departmentOptions}
            courseOptions={allCourses}
            action={saveCourseAction}
          />
          <EntityDeleteButton
            action={deleteCourseAction}
            entityId={course.id}
            title={`Delete ${course.code}?`}
            description="This permanently deletes the course, its prerequisites and any course sections. This cannot be undone."
            confirmLabel="Delete course"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        description="The course catalog with credit hours and prerequisite chains."
        actions={
          <CourseFormDialog
            departmentOptions={departmentOptions}
            courseOptions={allCourses}
            action={saveCourseAction}
          />
        }
      />

      <StatCard
        label="Courses"
        value={courses.meta.total}
        hint={`Page ${courses.meta.page} of ${Math.max(courses.meta.totalPages, 1)}`}
        icon={BookOpen}
        tone="primary"
        className="sm:max-w-xs"
      />

      <div className="flex flex-wrap items-center gap-2">
        <TableSearch placeholder="Search code or title" className="sm:w-64" />
        <TableFilter
          paramKey="departmentId"
          label="Filter by department"
          allLabel="All departments"
          options={departmentOptions}
        />
      </div>

      {courses.data.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description={
            departmentOptions.length === 0
              ? "Create a department first, then add courses."
              : "Add courses with credit hours; sections and prerequisites come from the catalog."
          }
          action={
            departmentOptions.length === 0 ? undefined : (
              <CourseFormDialog
                departmentOptions={departmentOptions}
                courseOptions={allCourses}
                action={saveCourseAction}
              />
            )
          }
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={courses.data}
            getRowKey={(course) => course.id}
          />
          <TablePagination
            page={courses.meta.page}
            totalPages={courses.meta.totalPages}
            total={courses.meta.total}
          />
        </>
      )}
    </div>
  );
}
