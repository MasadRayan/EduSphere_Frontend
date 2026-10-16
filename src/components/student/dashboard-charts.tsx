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
import { formatCurrency } from "@/lib/format";
import type { StudentAnalytics } from "@/types/entities";

const GRADES_CONFIG = {
  count: { label: "Courses" },
} satisfies ChartConfig;

const ATTENDANCE_CONFIG = {
  attended: { label: "Attended", color: "var(--chart-2)" },
  missed: { label: "Missed", color: "var(--chart-5)" },
} satisfies ChartConfig;

const CREDITS_CONFIG = {
  completed: { label: "Completed credits", color: "var(--chart-1)" },
  inProgress: { label: "Credits in progress", color: "var(--chart-3)" },
} satisfies ChartConfig;

const FINANCE_CONFIG = {
  amount: { label: "Amount" },
} satisfies ChartConfig;

function GradeDistributionChart({
  grades,
}: {
  grades: StudentAnalytics["grades"];
}) {
  const data = Object.entries(grades.gradeBreakdown)
    .map(([grade, count]) => ({ grade, count }))
    .sort((a, b) => a.grade.localeCompare(b.grade));

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Grade distribution</CardTitle>
        <CardDescription>
          Letter grades across completed courses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={GRADES_CONFIG} className="max-h-56 w-full">
          <BarChart data={data} barCategoryGap={24}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="grade"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
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
            <Bar dataKey="count" fill="var(--chart-1)" radius={6} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function AttendanceChart({
  attendance,
}: {
  attendance: StudentAnalytics["attendance"];
}) {
  const missed = Math.max(
    attendance.totalClasses - attendance.attendedClasses,
    0,
  );
  const data = [
    { key: "attended", value: attendance.attendedClasses },
    { key: "missed", value: missed },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance</CardTitle>
        <CardDescription>Share of classes attended so far.</CardDescription>
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
          {attendance.attendancePercentage}%
        </p>
        <p className="text-center text-xs text-muted-foreground">
          {attendance.attendedClasses} of {attendance.totalClasses} classes
        </p>
      </CardContent>
    </Card>
  );
}

function CreditsChart({
  academic,
}: {
  academic: StudentAnalytics["academic"];
}) {
  const data = [
    { key: "completed", value: academic.totalCreditsCompleted },
    { key: "inProgress", value: academic.inProgressCredits },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credits</CardTitle>
        <CardDescription>Completed versus in progress.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={CREDITS_CONFIG} className="max-h-44 w-full">
          <BarChart data={data} layout="vertical" barCategoryGap={20}>
            <XAxis type="number" tickLine={false} axisLine={false} hide />
            <YAxis
              type="category"
              dataKey="key"
              tickLine={false}
              axisLine={false}
              width={88}
              tickFormatter={(value: string) =>
                value === "completed" ? "Completed" : "In progress"
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
          {academic.completedCourses} courses completed,{" "}
          {academic.coursesInProgress} in progress.
        </p>
      </CardContent>
    </Card>
  );
}

function FinanceChart({ finance }: { finance: StudentAnalytics["finance"] }) {
  const data = [
    { label: "Spent", amount: finance.totalAmountSpent },
    { label: "Refunded", amount: finance.totalRefunded },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spend</CardTitle>
        <CardDescription>Tuition payments and refunds.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={FINANCE_CONFIG} className="max-h-44 w-full">
          <BarChart data={data} layout="vertical" barCategoryGap={20}>
            <XAxis type="number" tickLine={false} axisLine={false} hide />
            <YAxis
              type="category"
              dataKey="label"
              tickLine={false}
              axisLine={false}
              width={88}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="amount" fill="var(--chart-1)" radius={6} />
          </BarChart>
        </ChartContainer>
        <p className="text-xs text-muted-foreground">
          Paid {formatCurrency(finance.totalAmountSpent)}, refunded{" "}
          {formatCurrency(finance.totalRefunded)}.
        </p>
      </CardContent>
    </Card>
  );
}

export function DashboardCharts({
  analytics,
}: {
  analytics: StudentAnalytics;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <GradeDistributionChart grades={analytics.grades} />
      <AttendanceChart attendance={analytics.attendance} />
      <CreditsChart academic={analytics.academic} />
      <FinanceChart finance={analytics.finance} />
    </div>
  );
}
