import { CalendarCheck } from "lucide-react";
import type { Metadata } from "next";
import { AttendanceSheet } from "@/components/instructor/attendance-sheet";
import { DateFilter } from "@/components/instructor/date-filter";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { TableFilter } from "@/components/shared/table-filter";
import { requireRole } from "@/lib/auth/roles";
import {
  getMySections,
  getSectionRoster,
  listSectionAttendance,
} from "@/lib/instructor/service";
import { firstParam } from "@/lib/search-params";

export const metadata: Metadata = { title: "Attendance" };

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole("INSTRUCTOR");
  const params = await searchParams;
  const courseSectionId = firstParam(params.courseSectionId);
  const date = firstParam(params.date);

  const sections = await getMySections();
  const activeSection = courseSectionId
    ? sections.find((section) => section.id === courseSectionId)
    : undefined;

  const roster = activeSection ? await getSectionRoster(activeSection.id) : [];

  const records = activeSection
    ? await listSectionAttendance(activeSection.id)
    : [];

  const selectedDate = date ?? new Date().toISOString().slice(0, 10);
  const rows = roster.map((entry) => {
    const record = records.find(
      (item) =>
        item.studentId === entry.profileId &&
        item.date.slice(0, 10) === selectedDate,
    );
    return {
      studentId: entry.profileId,
      code: entry.student.studentId,
      name: entry.student.user.name,
      email: entry.student.user.email,
      existingStatus: record?.status ?? null,
    };
  });

  const activeDateRecords = records.filter(
    (record) => record.date.slice(0, 10) === selectedDate,
  );
  const presentCount = activeDateRecords.filter(
    (record) => record.status === "PRESENT",
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Pick a section and a class date, mark each student and save. Saving the same date again overwrites it."
      />

      <div className="flex flex-wrap gap-2">
        {sections.length > 0 ? (
          <TableFilter
            paramKey="courseSectionId"
            label="Course section"
            allLabel="All course sections"
            options={sections.map((section) => ({
              value: section.id,
              label: `${section.course?.code ?? "Course"} - ${section.sectionCode}`,
            }))}
          />
        ) : null}
        {activeSection ? <DateFilter /> : null}
      </div>

      {!activeSection ? (
        <EmptyState
          icon={CalendarCheck}
          title={
            sections.length === 0
              ? "No sections assigned yet"
              : "Select a course section"
          }
          description={
            sections.length === 0
              ? "You can mark attendance once the admin assigns course sections to you."
              : "Choose one of your sections above to open its attendance sheet."
          }
        />
      ) : roster.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No students in this section yet"
          description="Students appear here once attendance or results exist for them in this section."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Students"
              value={roster.length}
              icon={CalendarCheck}
            />
            <StatCard
              label={`Present on ${selectedDate}`}
              value={`${presentCount}/${roster.length}`}
              icon={CalendarCheck}
              tone="success"
            />
            <StatCard
              label="Class dates recorded"
              value={
                new Set(records.map((record) => record.date.slice(0, 10))).size
              }
              icon={CalendarCheck}
              tone="primary"
            />
          </div>

          <AttendanceSheet
            key={`${activeSection.id}-${selectedDate}`}
            courseSectionId={activeSection.id}
            date={selectedDate}
            rows={rows}
          />
        </>
      )}
    </div>
  );
}
