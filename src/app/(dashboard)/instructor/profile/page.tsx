import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/instructor/profile-form";
import { PageHeader } from "@/components/shared/page-header";
import { AvatarUpload } from "@/components/student/avatar-upload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { getInstructorMe } from "@/lib/instructor/service";

export const metadata: Metadata = { title: "My profile" };

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

export default async function InstructorProfilePage() {
  const session = await getSession();

  if (!session || session.role !== "INSTRUCTOR") {
    redirect("/login");
  }

  const me = await getInstructorMe();
  const profile = me.instructorProfile;
  const application = me.instructorApplication;
  const sections = profile?.courseSections ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My profile"
        description="Your photo, contact details and teaching record."
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
              endpoint="/api/proxy/api/instructor/avatar"
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
        ) : null}
      </div>

      {profile ? (
        <Card>
          <CardHeader>
            <CardTitle>Teaching record</CardTitle>
            <CardDescription>
              These details are managed by the admin office.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Detail
                label="Staff code"
                value={profile.instructorCode ?? profile.instructorId ?? "-"}
              />
              <Detail label="Designation" value={profile.designation ?? "-"} />
              <Detail
                label="Department"
                value={profile.department?.name ?? "-"}
              />
              <Detail label="Email" value={me.email} />
              <Detail label="Sections" value={String(sections.length)} />
              <Detail
                label="Courses taught"
                value={String(
                  new Set(
                    sections
                      .map((section) => section.course?.code)
                      .filter(Boolean),
                  ).size,
                )}
              />
            </dl>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
