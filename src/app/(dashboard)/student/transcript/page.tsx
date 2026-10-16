import { BookOpen, GraduationCap, ScrollText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { TableFilter } from "@/components/shared/table-filter";
import { TranscriptDownload } from "@/components/student/transcript-download";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/roles";
import { firstParam } from "@/lib/search-params";
import { getCgpa, getStudentMe, listSemesters } from "@/lib/student/service";

export const metadata: Metadata = { title: "Transcript" };

export default async function StudentTranscriptPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole("STUDENT");
  const params = await searchParams;
  const semesterId = firstParam(params.semesterId);

  const [me, cgpa, semesters] = await Promise.all([
    getStudentMe(),
    getCgpa(),
    listSemesters(),
  ]);

  const profile = me.studentProfile;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transcript"
        description="Download your official academic transcript as a PDF, optionally scoped to one semester."
        actions={<TranscriptDownload semesterId={semesterId} />}
      />

      <TableFilter
        paramKey="semesterId"
        label="Filter by semester"
        allLabel="All semesters"
        options={semesters.map((semester) => ({
          value: semester.id,
          label: `${semester.name} ${semester.year}`,
        }))}
      />

      {cgpa.courseCount === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="Nothing on your transcript yet"
          description="The transcript only includes courses marked COMPLETED. Once you finish graded courses, download it from here."
          action={
            <Button asChild>
              <Link href="/student/enroll">Enroll in courses</Link>
            </Button>
          }
        />
      ) : (
        <>
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
              icon={BookOpen}
              tone="primary"
            />
            <StatCard
              label="Courses completed"
              value={cgpa.courseCount}
              icon={GraduationCap}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transcript details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-border pb-3">
                <span className="text-muted-foreground">Student</span>
                <span className="text-right">
                  {profile?.fullName ?? me.name}
                </span>
              </div>
              <div className="flex justify-between gap-4 border-b border-border pb-3">
                <span className="text-muted-foreground">Student ID</span>
                <span className="font-mono">{profile?.studentId ?? "-"}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-border pb-3">
                <span className="text-muted-foreground">Department</span>
                <span className="text-right">
                  {profile?.department?.name ?? "-"}
                </span>
              </div>
              <div className="flex justify-between gap-4 border-b border-border pb-3">
                <span className="text-muted-foreground">Program</span>
                <span className="text-right">
                  {profile?.program?.name ?? "-"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Enrollment year</span>
                <span className="font-mono">
                  {profile?.enrollmentYear ?? "-"}
                </span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
