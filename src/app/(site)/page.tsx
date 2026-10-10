import {
  ArrowRight,
  ClipboardCheck,
  Landmark,
  Receipt,
  ScrollText,
  UserRound,
  UserRoundCog,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CourseCodeTag } from "@/components/shared/course-code-tag";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const HERO_COURSES = [
  {
    code: "CSE-101",
    title: "Computer Fundamentals",
    credits: 3,
    section: "Sec A",
  },
  { code: "MAT-201", title: "Linear Algebra", credits: 3, section: "Sec B" },
  { code: "ENG-105", title: "Academic Writing", credits: 2, section: "Sec A" },
];

const HERO_STAGES = ["Apply", "Enroll", "Pay", "Graduate"];

const STEPS = [
  {
    no: "01",
    title: "Create your account",
    body: "Sign up with your email and confirm the 6-digit code we send you.",
  },
  {
    no: "02",
    title: "Apply to a program",
    body: "Send your details and documents. The registrar reviews and approves.",
  },
  {
    no: "03",
    title: "Pick your courses",
    body: "Choose up to 20 courses a term. We check seats, credits and prerequisites.",
  },
  {
    no: "04",
    title: "Pay with bKash",
    body: "Pay the semester fee and your seats are confirmed the moment it succeeds.",
  },
  {
    no: "05",
    title: "Track your semester",
    body: "Follow attendance, results and your CGPA, then download your transcript.",
  },
];

const ROLES = [
  {
    icon: UserRound,
    title: "For students",
    body: "Apply, enroll and pay in one place, then follow grades and attendance term by term.",
    points: ["Course enrollment", "bKash payments", "Grades and CGPA"],
  },
  {
    icon: Users,
    title: "For instructors",
    body: "See the students in your sections, mark attendance and enter results in bulk.",
    points: ["My sections", "Bulk attendance", "Exam results"],
  },
  {
    icon: UserRoundCog,
    title: "For administrators",
    body: "Review applications, run programs and courses, and keep an eye on the numbers.",
    points: [
      "Application review",
      "Programs and courses",
      "Payments and analytics",
    ],
  },
];

const FAQS = [
  {
    q: "Is it free to apply?",
    a: "Yes. Creating an account and submitting an application cost nothing. You only pay the semester fee after the registrar approves you and you enroll in courses.",
  },
  {
    q: "How do I confirm my account?",
    a: "We email a 6-digit code when you sign up. Enter it on the verification screen to activate your account and continue to your dashboard.",
  },
  {
    q: "How many courses can I take in a term?",
    a: "Up to 20. EduSphere checks seats, your credit load and prerequisites as you add each course, so you only confirm a valid schedule.",
  },
  {
    q: "When is my seat confirmed?",
    a: "When your bKash payment succeeds. Until then a course sits in your schedule as pending, and the seat is released if the fee is not paid before the deadline.",
  },
  {
    q: "How do I pay the semester fee?",
    a: "Through bKash from your dashboard. You can pay the full fee or a partial amount, and every transaction is recorded on your student ledger.",
  },
  {
    q: "Where do I see my grades and transcript?",
    a: "Attendance, exam results and your running CGPA are on your dashboard each term. Once results are published you can download a verifiable PDF transcript.",
  },
];

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "EduSphere | The registrar, online",
    description:
      "Applications, enrollment, bKash payments, attendance and results, all on one student record.",
  },
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="relative isolate overflow-hidden border-b border-border">
        <div
          aria-hidden="true"
          className="ledger-paper pointer-events-none absolute inset-0 -z-10 opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
        />
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="space-y-6">
            <p className="reveal font-mono text-xs tracking-[0.2em] text-primary uppercase">
              The registrar, online
            </p>
            <h1 className="reveal reveal-1 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              From application to transcript, on one ledger.
            </h1>
            <p className="reveal reveal-2 max-w-xl text-lg text-muted-foreground">
              EduSphere runs the whole semester for students, instructors and
              administrators: applications, enrollment, bKash payments,
              attendance and results, all on one record.
            </p>
            <div className="reveal reveal-3 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/register">
                  Create your account
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </div>
            <ul className="reveal reveal-3 flex flex-wrap items-center gap-x-3 gap-y-2 pt-2 font-mono text-xs tracking-widest text-muted-foreground uppercase">
              {HERO_STAGES.map((stage, index) => (
                <li key={stage} className="flex items-center gap-3">
                  {index > 0 ? (
                    <span className="h-3 w-px bg-border" aria-hidden="true" />
                  ) : null}
                  {stage}
                </li>
              ))}
            </ul>
          </div>

          <div className="reveal reveal-2">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-5 py-3">
                <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                  Fall 2026 · Registration
                </span>
                <StatusBadge status="ENROLLED" />
              </div>
              <div className="divide-y divide-border">
                {HERO_COURSES.map((course) => (
                  <div
                    key={course.code}
                    className="flex items-center justify-between gap-4 px-5 py-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <CourseCodeTag
                        code={course.code}
                        credits={course.credits}
                      />
                      <span className="text-sm font-medium">
                        {course.title}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {course.section}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-border px-5 py-3">
                <span className="text-sm text-muted-foreground">
                  Total credits
                </span>
                <span className="font-mono text-sm font-semibold">8</span>
              </div>
              <div className="flex items-center gap-2 border-t border-border bg-warning/10 px-5 py-3 text-xs text-foreground">
                <span
                  className="size-1.5 rounded-full bg-warning"
                  aria-hidden="true"
                />
                Payment due 15 Aug 2026
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-20 border-b border-border"
      >
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 md:py-24 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-4 self-start lg:sticky lg:top-24">
            <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
              How it works
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Five steps, one record.
            </h2>
            <p className="max-w-md text-muted-foreground">
              Every step writes to the same student record, so nothing is
              re-entered and nothing is lost between offices.
            </p>
            <Button asChild variant="outline">
              <Link href="/register">
                Start your application
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <ol className="relative border-l border-border pl-8">
            {STEPS.map((step) => (
              <li key={step.no} className="relative pb-10 last:pb-0">
                <span
                  className="absolute top-0 -left-8 flex size-8 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-card font-mono text-xs font-medium text-primary"
                  aria-hidden="true"
                >
                  {step.no}
                </span>
                <h3 className="font-display text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="mt-1 max-w-lg text-sm text-muted-foreground">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-16 md:py-24">
          <div className="space-y-4">
            <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
              Built for every role
            </p>
            <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              One semester, seen from three desks.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {ROLES.map((role) => (
              <div
                key={role.title}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-6"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <role.icon className="size-5" aria-hidden="true" />
                </span>
                <div className="space-y-1.5">
                  <h3 className="font-display text-lg font-semibold">
                    {role.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{role.body}</p>
                </div>
                <ul className="mt-1 space-y-2 border-t border-border pt-4">
                  {role.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <ClipboardCheck
                        className="size-4 text-success"
                        aria-hidden="true"
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 border-b border-border">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 md:py-24 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-4 self-start lg:sticky lg:top-24">
            <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
              Questions
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Answers before you enroll.
            </h2>
            <p className="max-w-md text-muted-foreground">
              Everything about applying, paying and tracking your semester.
              Still stuck? The registrar can help.
            </p>
            <Button asChild variant="outline">
              <Link href="/contact">
                Contact the registrar
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <Accordion type="single" collapsible className="self-start">
            {FAQS.map((faq, index) => (
              <AccordionItem key={faq.q} value={`faq-${index}`}>
                <AccordionTrigger className="items-center py-4 text-base hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="max-w-prose text-sm text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-ink text-ink-foreground">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-6 -right-4 font-mono text-[7rem] leading-none font-bold tracking-tighter text-ink-foreground/5 select-none sm:text-[10rem]"
        >
          CSE-101
        </span>
        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-start gap-8 px-4 py-16 md:flex-row md:items-center md:justify-between md:py-20">
          <div className="max-w-2xl space-y-4">
            <p className="font-mono text-xs tracking-[0.2em] text-ink-muted uppercase">
              Next semester
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Open your file on EduSphere.
            </h2>
            <p className="text-ink-muted">
              Applications are free. You only pay when you enroll in a semester.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-warning text-warning-foreground hover:bg-warning/90"
            >
              <Link href="/register">
                Create your account
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-ink-foreground/30 bg-transparent text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground"
            >
              <Link href="/programs">Browse programs</Link>
            </Button>
          </div>
        </div>
        <div className="relative mx-auto flex w-full max-w-7xl flex-wrap items-center gap-6 px-4 pb-12 text-ink-muted">
          <span className="flex items-center gap-2 text-sm">
            <Landmark className="size-4" aria-hidden="true" />
            Registrar-approved
          </span>
          <span className="flex items-center gap-2 text-sm">
            <Receipt className="size-4" aria-hidden="true" />
            bKash payments
          </span>
          <span className="flex items-center gap-2 text-sm">
            <ScrollText className="size-4" aria-hidden="true" />
            Verifiable transcript
          </span>
        </div>
      </section>
    </div>
  );
}
