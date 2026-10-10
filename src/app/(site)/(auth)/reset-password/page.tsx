import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FormSkeleton } from "@/components/auth/form-skeleton";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PENDING_EMAIL_COOKIE } from "@/lib/auth/cookie-config";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new password for your EduSphere account.",
};

async function ResetPasswordSection() {
  const store = await cookies();
  const email = store.get(PENDING_EMAIL_COOKIE)?.value;

  if (!email) {
    redirect("/forgot-password");
  }

  return <ResetPasswordForm email={email} />;
}

export default function ResetPasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-2xl">Reset password</CardTitle>
        <CardDescription>
          Enter the code we sent you and choose a new password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<FormSkeleton />}>
          <ResetPasswordSection />
        </Suspense>
      </CardContent>
      <CardContent className="pt-0 text-sm text-muted-foreground">
        Need a new code?{" "}
        <Link href="/forgot-password" className="text-primary hover:underline">
          Send again
        </Link>
      </CardContent>
    </Card>
  );
}
