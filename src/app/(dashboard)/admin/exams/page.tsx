import { ClipboardList } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { DeleteExamButton } from "@/components/instructor/delete-exam-button";
import { ExamFormDialog } from "@/components/instructor/exam-form-dialog";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { TableFilter } from "@/components/shared/table-filter";
import { TablePagination } from "@/components/shared/table-pagination";
import { Button } from "@/components/ui/button";
import {
  adminDeleteExamAction,
  adminSaveExamAction,
} from "@/lib/admin/actions";
import { listAllCourseSections, listAllExams } from "@/lib/admin/service";
import { requireRole } from "@/lib/auth/roles";
import { formatDate } from "@/lib/format";
import { readPage } from "@/lib/search-params";
import type { InstructorExam } from "@/types/entities";

export const metadata: Metadata = { title: "Exams" };

export default async function AdminExamsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const params = await searchParams;
  const raw = params.courseSectionId;
  const courseSectionId = Array.isArray(raw) ? raw[0] : raw;
  const page = readPage(params.page);

  const [exams, sections] = await Promise.all([
    listAllExams(courseSectionId, page),
    listAllCourseSections({ page: 1, limit: 100 }),
  ]);

  const now = Date.now();
  const upcoming = exams.data.filter(
    (exam) => new Date(exam.date).getTime() > now,
  ).length;

  const columns: DataTableColumn<InstructorExam>[] = [
    {
      id: "course",
      header: "Course",
      cell: (exam) => (
        <div className="space-y-0.5">
          <span className="inline-flex w-fit items-center rounded-md border border-border bg-card px-2 py-0.5 font-mono text-xs font-medium tracking-tight text-foreground">
            {exam.courseSection?.course?.code ?? "Course"}
          </span>
          <p className="truncate text-xs text-muted-foreground">
            {exam.courseSection?.course?.title ?? ""}
          </p>
        </div>
      ),
    },
    {
      id: "section",
      header: "Section",
      cell: (exam) => (
        <div className="space-y-0.5">
          <p className="font-medium">
            {exam.courseSection?.sectionCode ?? "-"}
          </p>
          {exam.courseSection?.semester ? (
            <p className="text-xs text-muted-foreground">
              {exam.courseSection.semester.name}{" "}
              {exam.courseSection.semester.year}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      cell: (exam) => (
        <span className="font-medium">
          {exam.type.charAt(0) + exam.type.slice(1).toLowerCase()}
        </span>
      ),
    },
    {
      id: "date",
      header: "Date",
      cell: (exam) => (
        <span className="font-mono">{formatDate(exam.date)}</span>
      ),
    },
    {
      id: "marks",
      header: "Total marks",
      cell: (exam) => <span className="font-mono">{exam.totalMarks}</span>,
    },
    {
      id: "actions",
      headClassName: "text-right",
      cellClassName: "text-right",
      header: <span className="sr-only">Actions</span>,
      cell: (exam) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link
              href={`/admin/results?examId=${exam.id}${
                exam.sectionId ? `&courseSectionId=${exam.sectionId}` : ""
              }`}
            >
              View results
            </Link>
          </Button>
          <ExamFormDialog
            sections={sections.data}
            mode="edit"
            exam={exam}
            action={adminSaveExamAction}
          />
          <DeleteExamButton
            action={adminDeleteExamAction}
            examId={exam.id}
            examLabel={`${exam.type} of ${exam.courseSection?.course?.code ?? "course"} section ${exam.courseSection?.sectionCode ?? ""}`}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exams"
        description="Every scheduled exam across sections. Create exams on behalf of sections and jump into results."
        actions={
          <ExamFormDialog
            sections={sections.data}
            mode="create"
            action={adminSaveExamAction}
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Exams"
          value={exams.meta.total}
          icon={ClipboardList}
          tone="primary"
        />
        <StatCard
          label="Upcoming"
          value={upcoming}
          icon={ClipboardList}
          tone="warning"
        />
        <StatCard
          label="Sections"
          value={sections.meta.total}
          hint="See Academic structure"
          icon={ClipboardList}
        />
      </div>

      <TableFilter
        paramKey="courseSectionId"
        label="Filter by section"
        allLabel="All sections"
        className="sm:w-64"
        options={sections.data.map((section) => ({
          value: section.id,
          label: `${section.course?.code ?? "Course"} - ${section.sectionCode}`,
        }))}
      />

      {exams.data.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No exams yet"
          description={
            courseSectionId
              ? "No exams in this section yet."
              : "Create the first exam for any course section."
          }
          action={
            <ExamFormDialog
              sections={sections.data}
              mode="create"
              defaults={{ courseSectionId }}
              action={adminSaveExamAction}
            />
          }
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={exams.data}
            getRowKey={(exam) => exam.id}
          />
          <TablePagination
            page={exams.meta.page}
            totalPages={exams.meta.totalPages}
            total={exams.meta.total}
          />
        </>
      )}
    </div>
  );
}
