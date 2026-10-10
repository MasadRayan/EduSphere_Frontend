import type { Metadata } from "next";
import Link from "next/link";
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

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  const params = await searchParams;
  const next = safeNext(typeof params.next === "string" ? params.next : null);
  const justReset = params.reset === "1";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Log in to continue to your dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm next={next} justReset={justReset} />
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
