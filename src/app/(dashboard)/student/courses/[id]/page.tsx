import { BookOpen, Calendar, Clock } from "lucide-react";
import { notFound } from "next/navigation";
import { CourseCodeTag } from "@/components/shared/course-code-tag";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireRole } from "@/lib/auth/roles";
import { formatDate } from "@/lib/format";
import { getRegisteredCourseDetail } from "@/lib/student/service";

export default async function StudentCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("STUDENT");
  const { id } = await params;
  const registration = await getRegisteredCourseDetail(id);

  if (!registration) {
    notFound();
  }

  const section = registration.courseSection;
  const course = section.course;
  const semester = section.semester;
  const instructor = section.instructor?.user;
  const attendances = section.attendances ?? [];
  const present = attendances.filter(
    (record) => record.status === "PRESENT",
  ).length;
  const late = attendances.filter((record) => record.status === "LATE").length;
  const excused = attendances.filter(
    (record) => record.status === "EXCUSED",
  ).length;
  const attended = present + late + excused;
  const percentage = attendances.length
    ? Math.round((attended / attendances.length) * 100)
    : 0;
  const exams = section.exams ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {course?.title ?? "Course detail"}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <CourseCodeTag code={course?.code ?? ""} />
            <span className="text-sm text-muted-foreground">
              {course?.creditHours ?? 0} credits
            </span>
            <StatusBadge status={registration.status} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Section" value={section.sectionCode} icon={Clock} />
        <StatCard
          label="Semester"
          value={semester ? `${semester.name} ${semester.year}` : "-"}
          icon={Calendar}
        />
        <StatCard
          label="Registered"
          value={formatDate(registration.registeredAt)}
          icon={BookOpen}
        />
        <StatCard
          label="Attendance"
          value={percentage ? `${percentage}%` : "-"}
          icon={Calendar}
          hint={
            attendances.length
              ? `${attended} of ${attendances.length} classes`
              : undefined
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Schedule and instructor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-border pb-3">
              <span className="text-muted-foreground">Schedule</span>
              <span className="text-right">
                {section.schedule ?? "Not set"}
              </span>
            </div>
            <div className="flex justify-between gap-4 border-b border-border pb-3">
              <span className="text-muted-foreground">Capacity</span>
              <span className="font-mono">{section.capacity} seats</span>
            </div>
            <div className="flex justify-between gap-4 border-b border-border pb-3">
              <span className="text-muted-foreground">Instructor</span>
              <span className="text-right">
                {instructor?.name ?? "Not assigned"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Instructor email</span>
              <span className="text-right">{instructor?.email ?? "-"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{present} present</Badge>
              <Badge variant="outline">{late} late</Badge>
              <Badge variant="outline">{excused} excused</Badge>
              <Badge variant="outline">
                {attendances.length - attended} absent
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exams and results</CardTitle>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <p className="text-sm text-muted-foreground">No exams yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total marks</TableHead>
                  <TableHead>Marks obtained</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => {
                  const result = exam.results?.[0];
                  return (
                    <TableRow key={exam.id}>
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
                        {result?.marksObtained ?? "-"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={result?.grade?.toUpperCase() ?? "PENDING"}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
