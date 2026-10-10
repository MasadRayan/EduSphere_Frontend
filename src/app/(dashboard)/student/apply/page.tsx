import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ApplicationForm } from "@/components/student/application-form";
import { ApplicationStatusCard } from "@/components/student/application-status-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { listDepartments, listPrograms } from "@/lib/catalog/service";
import { getMyApplication } from "@/lib/student/service";

export const metadata: Metadata = { title: "Enrollment application" };

export default async function ApplyPage() {
  const session = await getSession();

  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }

  if (session.studentProfile) {
    redirect("/student");
  }

  const [application, departments, programs] = await Promise.all([
    getMyApplication(),
    listDepartments({ limit: 100 }),
    listPrograms({ limit: 100 }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enrollment application"
        description="Tell us which department and program you want to join. We review applications and notify you by email."
      />

      {application ? <ApplicationStatusCard application={application} /> : null}

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>
            {application ? "Application details" : "Your details"}
          </CardTitle>
          <CardDescription>
            {application
              ? "Update anything that changed and resubmit."
              : "All fields marked with an asterisk are required."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApplicationForm
            departments={departments.data}
            programs={programs.data}
            mode={application ? "edit" : "create"}
            defaults={
              application
                ? {
                    departmentId: application.departmentId,
                    programId: application.programId,
                    enrollmentYear: application.enrollmentYear,
                    phone: application.phone,
                  }
                : undefined
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
