import { CalendarCheck, GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseCodeTag } from "@/components/shared/course-code-tag";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError } from "@/lib/api/errors";
import { requireStudentProfile } from "@/lib/auth/roles";
import { formatDate } from "@/lib/format";
import { getGradeDetail } from "@/lib/student/service";
import type { GradeDetail } from "@/types/entities";

export const metadata: Metadata = { title: "Grade detail" };

export default async function StudentGradeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStudentProfile();
  const { id } = await params;

  let detail: GradeDetail;
  try {
    detail = await getGradeDetail(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const attendance = detail.attendance;
  const exams = [...detail.exams].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${detail.course.code} results`}
        description={`Every exam and the attendance record for ${detail.course.title}.`}
        actions={
          <Button asChild variant="outline">
            <Link href="/student/grades">Back to grades</Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <CourseCodeTag
          code={detail.course.code}
          credits={detail.course.creditHours}
        />
        <span className="text-sm text-muted-foreground">
          {detail.course.creditHours} credits
        </span>
        <StatusBadge status={detail.status} />
        <span className="text-sm text-muted-foreground">
          {detail.semester.name} {detail.semester.year} - Section{" "}
          {detail.sectionCode}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Average grade point"
          value={detail.averageGradePoint?.toFixed(2) ?? "-"}
          hint={
            detail.averageGradePoint
              ? "Across published exams"
              : "No marks published yet"
          }
          icon={GraduationCap}
          tone="warning"
        />
        <StatCard
          label="Attendance"
          value={attendance.totalClasses ? `${attendance.percentage}%` : "-"}
          hint={`${attendance.attendedClasses} of ${attendance.totalClasses} classes`}
          icon={CalendarCheck}
          tone={
            attendance.percentage >= 75
              ? "success"
              : attendance.percentage >= 60
                ? "warning"
                : "danger"
          }
        />
        <StatCard
          label="Exams"
          value={exams.length}
          hint={`Credits ${detail.course.creditHours}`}
          icon={GraduationCap}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exam results</CardTitle>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No exams have been held for this course yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total marks</TableHead>
                  <TableHead>Marks obtained</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Grade point</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam.examId}>
                    <TableCell className="font-medium capitalize">
                      {exam.type.toLowerCase()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(exam.date)}
                    </TableCell>
                    <TableCell className="font-mono">
                      {exam.totalMarks}
                    </TableCell>
                    <TableCell className="font-mono">
                      {exam.marksObtained ?? "-"}
                    </TableCell>
                    <TableCell>
                      {exam.grade ? (
                        <Badge variant="outline">{exam.grade}</Badge>
                      ) : (
                        <StatusBadge status="PENDING" />
                      )}
                    </TableCell>
                    <TableCell className="font-mono">
                      {exam.gradePoint?.toFixed(2) ?? "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
