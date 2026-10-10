import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { AvatarUpload } from "@/components/student/avatar-upload";
import { ProfileForm } from "@/components/student/profile-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { getStudentMe } from "@/lib/student/service";

export const metadata: Metadata = { title: "My profile" };

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

export default async function ProfilePage() {
  const session = await getSession();

  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }

  const me = await getStudentMe();
  const profile = me.studentProfile;
  const application = me.studentApplication;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My profile"
        description="Your photo, contact details and academic record."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile photo</CardTitle>
            <CardDescription>
              This photo appears across your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AvatarUpload
              name={profile?.fullName ?? me.name}
              currentUrl={profile?.avatarUrl ?? application?.avatarUrl ?? null}
            />
          </CardContent>
        </Card>

        {profile ? (
          <Card>
            <CardHeader>
              <CardTitle>Personal details</CardTitle>
              <CardDescription>
                Keep your name and phone up to date.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm
                defaults={{ fullName: profile.fullName, phone: profile.phone }}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Application</CardTitle>
              <CardDescription>
                {application
                  ? "Your application is being reviewed. Edit it from the application page."
                  : "You have not applied for enrollment yet."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {application ? (
                <dl className="grid gap-4 sm:grid-cols-2">
                  <Detail
                    label="Department"
                    value={application.department?.name ?? "-"}
                  />
                  <Detail
                    label="Program"
                    value={application.program?.name ?? "-"}
                  />
                  <Detail
                    label="Enrollment year"
                    value={String(application.enrollmentYear)}
                  />
                  <div className="flex flex-col gap-1">
                    <dt className="text-xs text-muted-foreground">Status</dt>
                    <dd>
                      <StatusBadge status={application.status} />
                    </dd>
                  </div>
                </dl>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>

      {profile ? (
        <Card>
          <CardHeader>
            <CardTitle>Academic record</CardTitle>
            <CardDescription>
              These details are managed by the registrar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Detail label="Student ID" value={profile.studentId} />
              <Detail
                label="Department"
                value={profile.department?.name ?? "-"}
              />
              <Detail label="Program" value={profile.program?.name ?? "-"} />
              <Detail
                label="Current semester"
                value={
                  profile.currentSemester
                    ? `${profile.currentSemester.name} ${profile.currentSemester.year}`
                    : "-"
                }
              />
              <Detail
                label="Section"
                value={profile.section?.sectionCode ?? "-"}
              />
              <Detail label="CGPA" value={profile.cgpa.toFixed(2)} />
              <div className="flex flex-col gap-1">
                <dt className="text-xs text-muted-foreground">Status</dt>
                <dd>
                  <StatusBadge status={profile.studentStatus} />
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
