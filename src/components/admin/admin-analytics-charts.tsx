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
import type { AdminAnalytics } from "@/types/entities";

const APPLICATIONS_CONFIG = {
  pending: { label: "Pending", color: "var(--chart-4)" },
  approved: { label: "Approved", color: "var(--chart-2)" },
  rejected: { label: "Rejected", color: "var(--chart-1)" },
} satisfies ChartConfig;

const ENROLLMENTS_CONFIG = {
  count: { label: "Count", color: "var(--chart-3)" },
} satisfies ChartConfig;

const FINANCE_CONFIG = {
  totalRevenue: { label: "Revenue", color: "var(--chart-2)" },
  totalRefunded: { label: "Refunded", color: "var(--chart-1)" },
  netRevenue: { label: "Net", color: "var(--chart-3)" },
} satisfies ChartConfig;

const ATTENDANCE_CONFIG = {
  present: { label: "Present", color: "var(--chart-2)" },
  missed: { label: "Missed", color: "var(--chart-5)" },
} satisfies ChartConfig;

function ApplicationsChart({
  applications,
}: {
  applications: AdminAnalytics["applications"];
}) {
  const data = [
    {
      group: "Students",
      pending: applications.student.pending,
      approved: applications.student.approved,
      rejected: applications.student.rejected,
    },
    {
      group: "Instructors",
      pending: applications.instructor.pending,
      approved: applications.instructor.approved,
      rejected: applications.instructor.rejected,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admissions funnel</CardTitle>
        <CardDescription>
          {applications.student.total} student and{" "}
          {applications.instructor.total} instructor applications in total.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={APPLICATIONS_CONFIG}
          className="max-h-56 w-full"
        >
          <BarChart data={data} barCategoryGap={24}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="group"
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
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="pending" fill="var(--color-pending)" radius={4} />
            <Bar dataKey="approved" fill="var(--color-approved)" radius={4} />
            <Bar dataKey="rejected" fill="var(--color-rejected)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function EnrollmentsChart({
  enrollments,
}: {
  enrollments: AdminAnalytics["enrollments"];
}) {
  const data = [
    {
      key: "Enrollments",
      count: enrollments.semesterEnrollments,
    },
    {
      key: "Enrolled",
      count: enrollments.enrolledEnrollments,
    },
    {
      key: "Registrations",
      count: enrollments.courseRegistrations,
    },
    {
      key: "Completed",
      count: enrollments.completedRegistrations,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrollment pipeline</CardTitle>
        <CardDescription>
          {enrollments.courseSections} course sections offered this cycle.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={ENROLLMENTS_CONFIG} className="max-h-56 w-full">
          <BarChart data={data} barCategoryGap={24}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="key"
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
            <Bar dataKey="count" fill="var(--color-count)" radius={6} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function FinanceChart({ finance }: { finance: AdminAnalytics["finance"] }) {
  const data = [
    { key: "totalRevenue", value: finance.totalRevenue },
    { key: "netRevenue", value: finance.netRevenue },
    { key: "totalRefunded", value: finance.totalRefunded },
  ];

  const labels: Record<string, string> = {
    totalRevenue: "Revenue",
    netRevenue: "Net",
    totalRefunded: "Refunded",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finance</CardTitle>
        <CardDescription>
          Revenue collected against refunds issued.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={FINANCE_CONFIG} className="max-h-44 w-full">
          <BarChart data={data} layout="vertical" barCategoryGap={20}>
            <XAxis type="number" tickLine={false} axisLine={false} hide />
            <YAxis
              type="category"
              dataKey="key"
              tickLine={false}
              axisLine={false}
              width={88}
              tickFormatter={(value: string) => labels[value] ?? value}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="value" radius={6}>
              {data.map((entry) => (
                <Cell key={entry.key} fill={`var(--color-${entry.key})`} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <p className="font-mono text-xs text-success">
          Net {finance.netRevenue.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}

function AttendanceChart({
  assessment,
}: {
  assessment: AdminAnalytics["assessment"];
}) {
  const missing = Math.max(
    assessment.attendanceRecords - assessment.presentRecords,
    0,
  );
  const data = [
    { key: "present", value: assessment.presentRecords },
    { key: "missed", value: missing },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance</CardTitle>
        <CardDescription>
          Present share of all marked records across sections.
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
          {assessment.attendanceRate}%
        </p>
        <p className="text-center text-xs text-muted-foreground">
          {assessment.presentRecords} of {assessment.attendanceRecords} records
          present.
        </p>
      </CardContent>
    </Card>
  );
}

export function AdminAnalyticsCharts({
  analytics,
}: {
  analytics: AdminAnalytics;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ApplicationsChart applications={analytics.applications} />
      <EnrollmentsChart enrollments={analytics.enrollments} />
      <FinanceChart finance={analytics.finance} />
      <AttendanceChart assessment={analytics.assessment} />
    </div>
  );
}
