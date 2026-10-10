import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FormSkeleton } from "@/components/auth/form-skeleton";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PENDING_EMAIL_COOKIE } from "@/lib/auth/cookie-config";
import { safeNext } from "@/lib/auth/redirects";

export const metadata: Metadata = {
  title: "Verify email",
  description: "Verify your email to finish creating your EduSphere account.",
};

type VerifySearchParams = Promise<{ next?: string }>;

async function VerifyEmailSection({
  searchParams,
}: {
  searchParams: VerifySearchParams;
}) {
  const store = await cookies();
  const email = store.get(PENDING_EMAIL_COOKIE)?.value;

  if (!email) {
    redirect("/register");
  }

  const params = await searchParams;
  const next = safeNext(typeof params.next === "string" ? params.next : null);

  return <VerifyEmailForm email={email} next={next} />;
}

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: VerifySearchParams;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-2xl">Verify email</CardTitle>
        <CardDescription>
          Almost there. Confirm the code we sent to finish creating your
          account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<FormSkeleton />}>
          <VerifyEmailSection searchParams={searchParams} />
        </Suspense>
      </CardContent>
      <CardContent className="pt-0 text-sm text-muted-foreground">
        Wrong address?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Start over
        </Link>
      </CardContent>
    </Card>
  );
}
