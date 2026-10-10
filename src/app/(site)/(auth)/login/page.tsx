import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your EduSphere account.",
};

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl">Log in</CardTitle>
        <CardDescription>
          Sign in with your email and password. This form is delivered in Phase
          2 (Authentication).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button disabled>Log in</Button>
        <p className="text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
