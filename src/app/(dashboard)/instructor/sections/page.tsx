import { CalendarDays, Clock, Layers, Users } from "lucide-react";
import type { Metadata } from "next";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { TableFilter } from "@/components/shared/table-filter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireInstructorProfile } from "@/lib/auth/roles";
import { getMySections, getSectionRoster } from "@/lib/instructor/service";
import { firstParam } from "@/lib/search-params";
import { listSemesters } from "@/lib/student/service";

export const metadata: Metadata = { title: "My sections" };

export default async function MySectionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireInstructorProfile();
  const params = await searchParams;
  const semesterId = firstParam(params.semesterId);

  const [sections, semesters] = await Promise.all([
    getMySections(semesterId),
    listSemesters(),
  ]);

  const rosters = await Promise.all(
    sections.map((section) => getSectionRoster(section.id)),
  );

  const totalSeats = sections.reduce(
    (sum, section) => sum + section.capacity,
    0,
  );
  const totalStudents = rosters.reduce((sum, roster) => sum + roster.length, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My sections"
        description="Every course section assigned to you this semester, with your enrolled students."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Sections"
          value={sections.length}
          icon={Layers}
          tone="primary"
        />
        <StatCard label="Capacity" value={totalSeats} icon={Users} />
        <StatCard
          label="Students found"
          value={totalStudents}
          hint="From attendance and results records"
          icon={Users}
          tone="success"
        />
      </div>

      <TableFilter
        paramKey="semesterId"
        label="Filter by semester"
        allLabel="All semesters"
        options={semesters.map((semester) => ({
          value: semester.id,
          label: `${semester.name} ${semester.year}`,
        }))}
      />

      {sections.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No sections assigned yet"
          description="The admin office assigns course sections to you. Once assigned, they show up here with your students."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {sections.map((section, index) => {
            const roster = rosters[index] ?? [];
            const fillRate = section.capacity
              ? Math.round((roster.length / section.capacity) * 100)
              : 0;
            return (
              <Card key={section.id}>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="inline-flex w-fit items-center rounded-md border border-border bg-card px-2 py-0.5 font-mono text-xs font-medium tracking-tight text-foreground">
                        {section.course?.code ?? "Course"}
                      </span>
                      <div className="min-w-0 space-y-0.5">
                        <p className="truncate font-medium">
                          {section.course?.title ?? "Untitled course"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Section {section.sectionCode}
                          {section.semester
                            ? ` - ${section.semester.name} ${section.semester.year}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={fillRate >= 90 ? "default" : "secondary"}
                      className="font-mono"
                    >
                      {roster.length}/{section.capacity}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" aria-hidden="true" />
                      {section.schedule ?? "Schedule to be announced"}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="size-3.5" aria-hidden="true" />
                      {section.semester
                        ? `${section.semester.name} ${section.semester.year}`
                        : "-"}
                    </span>
                  </div>

                  <Accordion type="single" collapsible>
                    <AccordionItem value={`roster-${section.id}`}>
                      <AccordionTrigger className="text-sm">
                        Enrolled students ({roster.length})
                      </AccordionTrigger>
                      <AccordionContent>
                        {roster.length === 0 ? (
                          <p className="rounded-lg border border-dashed border-border bg-card/60 px-4 py-6 text-center text-sm text-muted-foreground">
                            No student records yet. Students appear here once
                            attendance is marked or results are entered.
                          </p>
                        ) : (
                          <ul className="grid gap-2 sm:grid-cols-2">
                            {roster.map((entry) => (
                              <li
                                key={entry.profileId}
                                className="rounded-lg border border-border px-3 py-2"
                              >
                                <p className="truncate text-sm font-medium">
                                  {entry.student.user.name}
                                </p>
                                <p className="font-mono text-xs text-muted-foreground">
                                  {entry.student.studentId}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {entry.student.user.email}
                                </p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
