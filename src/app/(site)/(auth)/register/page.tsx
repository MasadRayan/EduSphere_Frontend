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
  title: "Create account",
  description: "Create your EduSphere account.",
};

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl">Create account</CardTitle>
        <CardDescription>
          Register as a student or instructor, then verify your email. This form
          is delivered in Phase 2 (Authentication).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button disabled>Create account</Button>
        <p className="text-sm text-muted-foreground">
          Already registered?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
