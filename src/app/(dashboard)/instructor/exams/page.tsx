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
import { Button } from "@/components/ui/button";
import { requireInstructorProfile } from "@/lib/auth/roles";
import { formatDate } from "@/lib/format";
import { deleteExamAction, saveExamAction } from "@/lib/instructor/actions";
import { getMySections, listSectionExams } from "@/lib/instructor/service";
import type { InstructorExam } from "@/types/entities";

export const metadata: Metadata = { title: "Exams" };

export default async function ExamsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireInstructorProfile();
  const params = await searchParams;
  const courseSectionId = Array.isArray(params.courseSectionId)
    ? params.courseSectionId[0]
    : params.courseSectionId;

  const sections = await getMySections();
  const exams = await listSectionExams(courseSectionId);

  const now = Date.now();
  const upcoming = exams.filter(
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
              href={`/instructor/results?examId=${exam.id}${
                exam.sectionId ? `&courseSectionId=${exam.sectionId}` : ""
              }`}
            >
              Enter results
            </Link>
          </Button>
          <ExamFormDialog
            sections={sections}
            mode="edit"
            exam={exam}
            action={saveExamAction}
          />
          <DeleteExamButton
            examId={exam.id}
            examLabel={`${exam.type} of ${exam.courseSection?.course?.code ?? "course"} section ${exam.courseSection?.sectionCode ?? ""}`}
            action={deleteExamAction}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exams"
        description="Create and manage exams for your sections, then enter results from the grading sheet."
        actions={
          <ExamFormDialog
            sections={sections}
            mode="create"
            action={saveExamAction}
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Exams" value={exams.length} icon={ClipboardList} />
        <StatCard
          label="Upcoming"
          value={upcoming}
          icon={ClipboardList}
          tone="warning"
        />
        <StatCard
          label="Sections"
          value={sections.length}
          icon={ClipboardList}
          tone="primary"
        />
      </div>

      <TableFilter
        paramKey="courseSectionId"
        label="Filter by section"
        allLabel="All sections"
        options={sections.map((section) => ({
          value: section.id,
          label: `${section.course?.code ?? "Course"} - ${section.sectionCode}`,
        }))}
      />

      {exams.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No exams yet"
          description={
            sections.length === 0
              ? "You have no course sections assigned yet, so there is nothing to schedule."
              : "Create an exam for one of your sections to start collecting marks."
          }
          action={
            sections.length === 0 ? undefined : (
              <ExamFormDialog
                sections={sections}
                mode="create"
                defaults={{ courseSectionId }}
                action={saveExamAction}
              />
            )
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={exams}
          getRowKey={(exam) => exam.id}
        />
      )}
    </div>
  );
}
