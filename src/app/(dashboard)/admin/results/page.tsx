import { GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { GradingSheet } from "@/components/instructor/grading-sheet";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { TableFilter } from "@/components/shared/table-filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  adminEnterResultsAction,
  adminUpdateResultAction,
} from "@/lib/admin/actions";
import { listAllCourseSections } from "@/lib/admin/service";
import { requireRole } from "@/lib/auth/roles";
import { formatDate } from "@/lib/format";
import {
  getExamResults,
  getSectionRoster,
  listSectionExams,
} from "@/lib/instructor/service";
import { firstParam } from "@/lib/search-params";
import type { InstructorExam, SectionStudent } from "@/types/entities";

export const metadata: Metadata = { title: "Results" };

export default async function AdminResultsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole("ADMIN", "SUPER_ADMIN");
  const params = await searchParams;
  const courseSectionId = firstParam(params.courseSectionId);
  const examId = firstParam(params.examId);

  const sections = await listAllCourseSections({ limit: 100 });
  const activeSection = courseSectionId
    ? sections.data.find((section) => section.id === courseSectionId)
    : undefined;

  if (!activeSection) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Results"
          description="Pick a course section, pick an exam, then view or adjust the grading sheet."
        />

        <div className="flex flex-wrap gap-2">
          {sections.data.length > 0 ? (
            <TableFilter
              paramKey="courseSectionId"
              label="Course section"
              allLabel="All course sections"
              className="sm:w-64"
              options={sections.data.map((section) => ({
                value: section.id,
                label: `${section.course?.code ?? "Course"} - ${section.sectionCode}`,
              }))}
            />
          ) : null}
        </div>

        <EmptyState
          icon={GraduationCap}
          title={
            sections.data.length === 0
              ? "No course sections yet"
              : "Select a course section"
          }
          description={
            sections.data.length === 0
              ? "Create course sections first, then results appear here."
              : "Choose a section above to see its exams."
          }
        />
      </div>
    );
  }

  const exams = await listSectionExams(activeSection.id);
  const activeExam = examId
    ? exams.find((exam) => exam.id === examId)
    : undefined;

  if (!activeExam) {
    const columns: DataTableColumn<InstructorExam>[] = [
      {
        id: "type",
        header: "Exam",
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
          <Button asChild size="sm">
            <Link
              href={`/admin/results?courseSectionId=${activeSection.id}&examId=${exam.id}`}
            >
              View results
            </Link>
          </Button>
        ),
      },
    ];

    return (
      <div className="space-y-6">
        <PageHeader
          title="Results"
          description={`${activeSection.course?.title ?? "Course"} - section ${activeSection.sectionCode}. Choose an exam to open its grading sheet.`}
          actions={
            <TableFilter
              paramKey="courseSectionId"
              label="Course section"
              allLabel="All course sections"
              className="sm:w-64"
              options={sections.data.map((section) => ({
                value: section.id,
                label: `${section.course?.code ?? "Course"} - ${section.sectionCode}`,
              }))}
            />
          }
        />

        {exams.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No exams in this section yet"
            description="Create exams from the Exams page, then manage results here."
            action={
              <Button asChild>
                <Link href={`/admin/exams?courseSectionId=${activeSection.id}`}>
                  Go to exams
                </Link>
              </Button>
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

  const [results, roster] = await Promise.all([
    getExamResults(activeExam.id),
    getSectionRoster(activeSection.id),
  ]);

  const resultByProfileId = new Map(
    results.map((result) => [result.studentId, result]),
  );
  const rosterByProfileId = new Map(
    roster.map((entry) => [entry.profileId, entry]),
  );

  // Students with a saved result but no attendance/result-derived roster entry.
  const rows = [
    ...roster.map((entry) => ({
      profileId: entry.profileId,
      student: entry.student,
      result: resultByProfileId.get(entry.profileId) ?? null,
    })),
    ...results
      .filter(
        (result) => result.student && !rosterByProfileId.has(result.studentId),
      )
      .map((result) => ({
        profileId: result.studentId,
        student: result.student as SectionStudent,
        result,
      })),
  ];

  const graded = rows.filter((row) => row.result?.grade).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grading sheet"
        description={`${activeSection.course?.code ?? "Course"} - section ${activeSection.sectionCode}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="font-mono">
              {activeExam.type.charAt(0) +
                activeExam.type.slice(1).toLowerCase()}
            </Badge>
            <Badge variant="secondary" className="font-mono">
              {formatDate(activeExam.date)}
            </Badge>
            <Badge variant="secondary" className="font-mono">
              {activeExam.totalMarks} marks
            </Badge>
          </div>
        }
      />

      <Card>
        <CardContent className="space-y-4">
          <GradingSheet
            key={activeExam.id}
            examId={activeExam.id}
            totalMarks={activeExam.totalMarks}
            rows={rows}
            enterAction={adminEnterResultsAction}
            updateAction={adminUpdateResultAction}
          />
          <p className="text-xs text-muted-foreground">
            {graded} of {rows.length} students graded. Changes here count for
            the whole section, like the instructor sheet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
