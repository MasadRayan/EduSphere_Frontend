import {
  ArrowRight,
  BookOpenCheck,
  CircleDollarSign,
  ClipboardPen,
} from "lucide-react";
import Link from "next/link";
import { CourseCodeTag } from "@/components/shared/course-code-tag";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    icon: ClipboardPen,
    title: "Apply and enroll",
    description:
      "Submit your application, get approved, then build your semester course by course.",
  },
  {
    icon: CircleDollarSign,
    title: "Pay with bKash",
    description:
      "Enroll, pay securely, and get a clear receipt for every transaction.",
  },
  {
    icon: BookOpenCheck,
    title: "Track your progress",
    description:
      "Attendance, grades, CGPA and your transcript, always up to date.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <section className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
        <div className="space-y-6">
          <p className="font-mono text-xs tracking-widest text-primary uppercase">
            University, in one place
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Every course, credit and deadline handled.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            EduSphere is the academic workspace for students, instructors and
            administrators. One place for enrollment, payments, attendance and
            results.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/register">
                Create your account
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/programs">Browse programs</Link>
            </Button>
          </div>
        </div>

        <Card className="justify-center">
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">This semester</p>
            {[
              { code: "CSE-101", title: "Computer Fundamentals", credits: 3 },
              { code: "MAT-201", title: "Linear Algebra", credits: 3 },
              { code: "ENG-105", title: "Academic Writing", credits: 2 },
            ].map((course) => (
              <div
                key={course.code}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background p-3"
              >
                <CourseCodeTag code={course.code} credits={course.credits} />
                <span className="text-sm text-muted-foreground">
                  {course.title}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-16 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="space-y-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="font-display text-lg font-semibold">
                {feature.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
