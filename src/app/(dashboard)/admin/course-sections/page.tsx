import { Layers } from "lucide-react";
import type { Metadata } from "next";
import { CourseSectionFormDialog } from "@/components/admin/course-section-form-dialog";
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
import {
  deleteCourseSectionAction,
  saveCourseSectionAction,
} from "@/lib/admin/actions";
import { listAllCourseSections, listInstructors } from "@/lib/admin/service";
import { requireRole } from "@/lib/auth/roles";
import { listCourses, listSemesters } from "@/lib/catalog/service";
import { readPage } from "@/lib/search-params";
import type { CourseSection } from "@/types/entities";

export const metadata: Metadata = { title: "Course sections" };

export default async function AdminCourseSectionsPage({
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
  const courseId = read("courseId");
  const semesterId = read("semesterId");
  const page = readPage(params.page);

  const [sections, courses, semesters, instructors] = await Promise.all([
    listAllCourseSections({ courseId, semesterId, page, limit: 10 }),
    listCourses({ limit: 100 }),
    listSemesters(),
    listInstructors({ limit: 100 }),
  ]);

  const courseOptions = courses.data.map((course) => ({
    value: course.id,
    label: `${course.code} - ${course.title}`,
  }));
  const semesterOptions = semesters.map((semester) => ({
    value: semester.id,
    label: `${semester.name} ${semester.year}`,
  }));
  const instructorOptions = instructors.data.map((instructor) => ({
    value: instructor.id,
    label: instructor.fullName,
  }));

  const columns: DataTableColumn<CourseSection>[] = [
    {
      id: "course",
      header: "Course",
      cell: (section) => (
        <div className="space-y-0.5">
          <span className="inline-flex w-fit items-center rounded-md border border-border bg-card px-2 py-0.5 font-mono text-xs font-medium tracking-tight text-foreground">
            {section.course?.code ?? "Course"}
          </span>
          <p className="max-w-56 truncate text-xs text-muted-foreground">
            {section.course?.title ?? ""}
          </p>
        </div>
      ),
    },
    {
      id: "section",
      header: "Section",
      cell: (section) => (
        <div className="space-y-0.5">
          <p className="font-mono font-medium">{section.sectionCode}</p>
          <p className="text-xs text-muted-foreground">
            {section.semester
              ? `${section.semester.name} ${section.semester.year}`
              : ""}
          </p>
        </div>
      ),
    },
    {
      id: "instructor",
      header: "Instructor",
      cell: (section) => (
        <span className="text-sm">
          {section.instructor?.user.name ?? "Unassigned"}
        </span>
      ),
    },
    {
      id: "capacity",
      header: "Seats",
      cell: (section) => <span className="font-mono">{section.capacity}</span>,
    },
    {
      id: "schedule",
      header: "Schedule",
      cell: (section) => (
        <span className="text-xs text-muted-foreground">
          {section.schedule || "-"}
        </span>
      ),
    },
    {
      id: "actions",
      headClassName: "text-right",
      cellClassName: "text-right",
      header: <span className="sr-only">Actions</span>,
      cell: (section) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <CourseSectionFormDialog
            section={section}
            courseOptions={courseOptions}
            semesterOptions={semesterOptions}
            instructorOptions={instructorOptions}
            action={saveCourseSectionAction}
          />
          <EntityDeleteButton
            action={deleteCourseSectionAction}
            entityId={section.id}
            title={`Delete section ${section.sectionCode}?`}
            description="This permanently deletes the section with its registrations, exams, attendance and results. This cannot be undone."
            confirmLabel="Delete section"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course sections"
        description="Offerings of a course in a semester, with capacity and an assigned instructor."
        actions={
          <CourseSectionFormDialog
            courseOptions={courseOptions}
            semesterOptions={semesterOptions}
            instructorOptions={instructorOptions}
            action={saveCourseSectionAction}
          />
        }
      />

      <StatCard
        label="Course sections"
        value={sections.meta.total}
        hint={`Page ${sections.meta.page} of ${Math.max(sections.meta.totalPages, 1)}`}
        icon={Layers}
        tone="primary"
        className="sm:max-w-xs"
      />

      <div className="flex flex-wrap items-center gap-2">
        <TableFilter
          paramKey="courseId"
          label="Filter by course"
          allLabel="All courses"
          options={courseOptions}
          className="sm:w-64"
        />
        <TableFilter
          paramKey="semesterId"
          label="Filter by semester"
          allLabel="All semesters"
          options={semesterOptions}
        />
      </div>

      {sections.data.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No course sections yet"
          description={
            courseOptions.length === 0 || semesterOptions.length === 0
              ? "Create a course and a semester first."
              : "Create a section so instructors can take attendance and grade."
          }
          action={
            courseOptions.length === 0 ||
            semesterOptions.length === 0 ? undefined : (
              <CourseSectionFormDialog
                courseOptions={courseOptions}
                semesterOptions={semesterOptions}
                instructorOptions={instructorOptions}
                action={saveCourseSectionAction}
              />
            )
          }
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={sections.data}
            getRowKey={(section) => section.id}
          />
          <TablePagination
            page={sections.meta.page}
            totalPages={sections.meta.totalPages}
            total={sections.meta.total}
          />
        </>
      )}
    </div>
  );
}
