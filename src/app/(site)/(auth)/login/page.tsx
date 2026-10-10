import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FormSkeleton } from "@/components/auth/form-skeleton";
import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { safeNext } from "@/lib/auth/redirects";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your EduSphere account.",
};

type LoginSearchParams = Promise<{ next?: string; reset?: string }>;

async function LoginSection({
  searchParams,
}: {
  searchParams: LoginSearchParams;
}) {
  const params = await searchParams;
  const next = safeNext(typeof params.next === "string" ? params.next : null);
  const justReset = params.reset === "1";

  return <LoginForm next={next} justReset={justReset} />;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: LoginSearchParams;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-2xl">Welcome back</CardTitle>
        <CardDescription>Log in to continue to your dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<FormSkeleton google />}>
          <LoginSection searchParams={searchParams} />
        </Suspense>
      </CardContent>
      <CardContent className="pt-0 text-sm text-muted-foreground">
        New to EduSphere?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Create an account
        </Link>
      </CardContent>
    </Card>
  );
}
