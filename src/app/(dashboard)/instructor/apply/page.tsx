import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ApplicationForm } from "@/components/instructor/application-form";
import { ApplicationStatusCard } from "@/components/instructor/application-status-card";
import { ResumeUpload } from "@/components/instructor/resume-upload";
import { PageHeader } from "@/components/shared/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { listDepartments } from "@/lib/catalog/service";
import { getInstructorApplication } from "@/lib/instructor/service";

export const metadata: Metadata = { title: "Teaching application" };

export default async function ApplyPage() {
  const session = await getSession();

  if (!session || session.role !== "INSTRUCTOR") {
    redirect("/login");
  }

  if (session.instructorProfile) {
    redirect("/instructor");
  }

  const [application, departments] = await Promise.all([
    getInstructorApplication(),
    listDepartments({ limit: 100 }),
  ]);

  const applied = Boolean(application);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teaching application"
        description="Tell us which department you want to teach in. We review applications and notify you by email."
      />

      {application ? <ApplicationStatusCard application={application} /> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>
              {applied ? "Application details" : "Your details"}
            </CardTitle>
            <CardDescription>
              {applied
                ? "Update anything that changed and resubmit."
                : "All fields marked with an asterisk are required."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApplicationForm
              departments={departments.data}
              mode={applied ? "edit" : "create"}
              defaults={
                application
                  ? {
                      departmentName: application.department?.name,
                      designation: application.designation,
                      phone: application.phone,
                      coverNote: application.coverNote,
                    }
                  : undefined
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resume</CardTitle>
            <CardDescription>
              Attach your latest CV so the reviewers can check your background.
              You can replace it any time before approval.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ResumeUpload resumeName={application?.resumeUrl ?? null} />
            {application?.resumeUrl ? (
              <a
                href={application.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted-foreground underline underline-offset-4"
              >
                Open current resume
              </a>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
