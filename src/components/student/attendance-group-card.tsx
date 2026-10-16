import Link from "next/link";
import { CourseCodeTag } from "@/components/shared/course-code-tag";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AttendanceGroup } from "@/types/entities";

const RECENT_RECORD_LIMIT = 8;

export function AttendanceGroupCard({
  group,
  registrationId,
  defaultOpen = false,
}: {
  group: AttendanceGroup;
  registrationId?: string;
  defaultOpen?: boolean;
}) {
  const records = [...group.records]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, RECENT_RECORD_LIMIT);

  return (
    <Card className="py-0">
      <CardHeader className="pb-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <CourseCodeTag
              code={group.course.code}
              credits={group.course.creditHours}
            />
            <CardTitle className="text-sm font-medium">
              {group.course.title}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Section {group.sectionCode} - {group.semester}
            </p>
          </div>
          <p
            className={cn(
              "font-mono text-2xl font-semibold tracking-tight",
              group.percentage >= 75
                ? "text-success"
                : group.percentage >= 60
                  ? "text-warning"
                  : "text-destructive",
            )}
          >
            {group.percentage}%
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{group.present} present</Badge>
          <Badge variant="outline">{group.late} late</Badge>
          <Badge variant="outline">{group.excused} excused</Badge>
          <Badge variant="outline">{group.absent} absent</Badge>
        </div>

        <Accordion
          type="single"
          collapsible
          defaultValue={defaultOpen ? group.courseSectionId : undefined}
        >
          <AccordionItem value={group.courseSectionId} className="border-none">
            <AccordionTrigger className="py-2 text-sm text-muted-foreground">
              Recent classes ({group.total} total)
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {records.map((record) => (
                  <div
                    key={`${record.date}-${record.status}`}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                  >
                    <span className="font-mono text-xs">
                      {formatDate(record.date)}
                    </span>
                    <StatusBadge status={record.status} />
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Showing the {records.length} most recent classes.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {registrationId ? (
          <Button asChild variant="ghost" size="sm">
            <Link href={`/student/courses/${registrationId}`}>
              View course detail
            </Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
