import { GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CourseCodeTag } from "@/components/shared/course-code-tag";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { requireStudentProfile } from "@/lib/auth/roles";
import {
  getCgpa,
  getGrades,
  getRegisteredCourses,
} from "@/lib/student/service";
import type { CourseGrade, CourseRegistration } from "@/types/entities";

export const metadata: Metadata = { title: "Grades" };

/** Grade rows have no registration id, so rebuild it from the registrations. */
function registrationKey(courseCode: string, sectionCode: string): string {
  return `${courseCode}:${sectionCode}`;
}

function registrationMap(
  registrations: CourseRegistration[],
): Map<string, string> {
  const map = new Map<string, string>();
  for (const registration of registrations) {
    const course = registration.courseSection.course;
    if (!course) {
      continue;
    }
    map.set(
      registrationKey(course.code, registration.courseSection.sectionCode),
      registration.id,
    );
  }
  return map;
}

export default async function StudentGradesPage() {
  await requireStudentProfile();

  const [grades, cgpa, registrations] = await Promise.all([
    getGrades(),
    getCgpa(),
    getRegisteredCourses(),
  ]);

  const registrationIds = registrationMap(registrations);

  const columns: DataTableColumn<CourseGrade>[] = [
    {
      id: "course",
      header: "Course",
      cell: (grade) => (
        <div className="space-y-0.5">
          <CourseCodeTag
            code={grade.course.code}
            credits={grade.course.creditHours}
          />
          <p className="font-medium">{grade.course.title}</p>
        </div>
      ),
    },
    {
      id: "semester",
      header: "Semester",
      cell: (grade) => <span>{grade.semester}</span>,
    },
    {
      id: "section",
      header: "Section",
      cell: (grade) => (
        <span className="font-mono text-xs">{grade.sectionCode}</span>
      ),
    },
    {
      id: "exams",
      header: "Exams",
      cell: (grade) => <span className="font-mono">{grade.exams.length}</span>,
    },
    {
      id: "marks",
      header: "Marks",
      cell: (grade) => (
        <span className="font-mono">
          {grade.marksObtained} / {grade.totalMarks}
        </span>
      ),
    },
    {
      id: "gradePoint",
      header: "Grade point",
      cell: (grade) => (
        <span className="font-mono">
          {grade.averageGradePoint?.toFixed(2) ?? "-"}
        </span>
      ),
    },
    {
      id: "actions",
      header: <span className="sr-only">View</span>,
      headClassName: "text-right",
      cellClassName: "text-right",
      cell: (grade) => {
        const registrationId = registrationIds.get(
          registrationKey(grade.course.code, grade.sectionCode),
        );
        if (!registrationId) {
          return <span className="text-muted-foreground">-</span>;
        }
        return (
          <Button asChild variant="ghost" size="sm">
            <Link href={`/student/grades/${registrationId}`}>View detail</Link>
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grades"
        description="Your exam results grouped by course, with the CGPA across all completed work."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="CGPA"
          value={cgpa.cgpa.toFixed(2)}
          hint="Weighted by credit hours"
          icon={GraduationCap}
          tone="warning"
        />
        <StatCard
          label="Credits completed"
          value={cgpa.totalCredits}
          icon={GraduationCap}
          tone="primary"
        />
        <StatCard
          label="Courses graded"
          value={cgpa.courseCount}
          icon={GraduationCap}
        />
      </div>

      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={grades}
          getRowKey={(grade) =>
            registrationKey(grade.course.code, grade.sectionCode)
          }
          empty={
            <EmptyState
              icon={GraduationCap}
              title="No grades yet"
              description="Results appear here once your instructors publish exam marks."
            />
          }
        />
      </div>
    </div>
  );
}
