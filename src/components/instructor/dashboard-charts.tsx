"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { InstructorAnalytics } from "@/types/entities";

const FILL_CONFIG = {
  capacity: { label: "Capacity", color: "var(--chart-1)" },
  filled: { label: "Seats filled", color: "var(--chart-2)" },
} satisfies ChartConfig;

const ATTENDANCE_CONFIG = {
  present: { label: "Present", color: "var(--chart-2)" },
  absent: { label: "Absent", color: "var(--chart-5)" },
} satisfies ChartConfig;

const EXAMS_CONFIG = {
  count: { label: "Exams" },
} satisfies ChartConfig;

function FillRateChart({
  sections,
}: {
  sections: InstructorAnalytics["sections"];
}) {
  const data = [
    { key: "filled", value: sections.seatsFilled },
    { key: "capacity", value: sections.totalCapacity },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seat fill rate</CardTitle>
        <CardDescription>
          Seats taken across your sections against total capacity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={FILL_CONFIG} className="max-h-44 w-full">
          <BarChart data={data} layout="vertical" barCategoryGap={20}>
            <XAxis type="number" tickLine={false} axisLine={false} hide />
            <YAxis
              type="category"
              dataKey="key"
              tickLine={false}
              axisLine={false}
              width={88}
              tickFormatter={(value: string) =>
                value === "filled" ? "Filled" : "Capacity"
              }
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="value" radius={6}>
              {data.map((entry) => (
                <Cell key={entry.key} fill={`var(--color-${entry.key})`} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <p className="text-xs text-muted-foreground">
          {sections.seatsFilled} of {sections.totalCapacity} seats,{" "}
          <span className="font-mono">{sections.fillRate}%</span> full across{" "}
          {sections.totalSections} sections.
        </p>
      </CardContent>
    </Card>
  );
}

function AttendanceChart({
  attendance,
}: {
  attendance: InstructorAnalytics["attendance"];
}) {
  const missed = Math.max(
    attendance.totalRecords - attendance.presentRecords,
    0,
  );
  const data = [
    { key: "present", value: attendance.presentRecords },
    { key: "absent", value: missed },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance</CardTitle>
        <CardDescription>
          Present share of every record that has been marked.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={ATTENDANCE_CONFIG}
          className="mx-auto max-h-56 w-full aspect-square"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="key"
              innerRadius={56}
              outerRadius={88}
              strokeWidth={2}
              stroke="var(--background)"
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={`var(--color-${entry.key})`} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <p className="text-center font-mono text-2xl font-semibold tracking-tight text-success">
          {attendance.attendanceRate}%
        </p>
        <p className="text-center text-xs text-muted-foreground">
          {attendance.presentRecords} of {attendance.totalRecords} records
          marked present.
        </p>
      </CardContent>
    </Card>
  );
}

function ExamsChart({ exams }: { exams: InstructorAnalytics["exams"] }) {
  const data = Object.entries(exams)
    .filter(([key]) => key !== "totalExams")
    .map(([key, count]) => ({
      key,
      count,
    }));

  const labels: Record<string, string> = {
    upcomingExams: "Upcoming",
    pendingGrading: "Pending grading",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exam pipeline</CardTitle>
        <CardDescription>
          {exams.totalExams} exams total. Pending grading still needs marks
          entered.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={EXAMS_CONFIG} className="max-h-44 w-full">
          <BarChart data={data} barCategoryGap={24}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="key"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: string) => labels[value] ?? value}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={24}
            />
            <ChartTooltip
              content={<ChartTooltipContent nameKey="count" hideLabel />}
            />
            <Bar dataKey="count" fill="var(--chart-4)" radius={6} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function DashboardCharts({
  analytics,
}: {
  analytics: InstructorAnalytics;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <FillRateChart sections={analytics.sections} />
      <AttendanceChart attendance={analytics.attendance} />
      <ExamsChart exams={analytics.exams} />
    </div>
  );
}
