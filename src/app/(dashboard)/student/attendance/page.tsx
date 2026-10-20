import { CalendarCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { AttendanceGroupCard } from "@/components/student/attendance-group-card";
import { Button } from "@/components/ui/button";
import { requireStudentProfile } from "@/lib/auth/roles";
import { getAttendance, getRegisteredCourses } from "@/lib/student/service";

export const metadata: Metadata = { title: "Attendance" };

export default async function StudentAttendancePage() {
  await requireStudentProfile();

  const [groups, registrations] = await Promise.all([
    getAttendance(),
    getRegisteredCourses(),
  ]);

  const registrationBySectionId = new Map(
    registrations.map((registration) => [
      registration.courseSectionId,
      registration.id,
    ]),
  );

  const totalClasses = groups.reduce((sum, group) => sum + group.total, 0);
  const attendedClasses = groups.reduce(
    (sum, group) => sum + group.present + group.late + group.excused,
    0,
  );
  const overallPercentage = totalClasses
    ? Math.round((attendedClasses / totalClasses) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Your attendance summary by course, with recent classes in each card."
      />

      {groups.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No attendance recorded yet"
          description="Instructors mark attendance against course sections. Records appear here after the first class is recorded."
          action={
            registrations.length === 0 ? (
              <Button asChild>
                <Link href="/student/enroll">Enroll in courses</Link>
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link href="/student/courses">View my courses</Link>
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Overall attendance"
              value={`${overallPercentage}%`}
              hint={`${attendedClasses} of ${totalClasses} classes`}
              icon={CalendarCheck}
              tone="success"
            />
            <StatCard
              label="Courses tracked"
              value={groups.length}
              icon={CalendarCheck}
              tone="primary"
            />
            <StatCard
              label="Classes attended"
              value={attendedClasses}
              hint={`${totalClasses} classes in total`}
              icon={CalendarCheck}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {groups.map((group, index) => (
              <AttendanceGroupCard
                key={group.courseSectionId}
                group={group}
                registrationId={registrationBySectionId.get(
                  group.courseSectionId,
                )}
                defaultOpen={index === 0}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
