import { CircleCheck, CircleX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Payment result" };

function reasonText(status: string | null, reason: string | null): string {
  if (reason) {
    return reason;
  }
  const known: Record<string, string> = {
    cancelled: "The payment was cancelled before it completed.",
    failed: "The payment could not be completed. Your money was not charged.",
    timeout: "The payment timed out. No money was charged.",
  };
  if (status && known[status.toLowerCase()]) {
    return known[status.toLowerCase()];
  }
  return "The payment did not succeed. No money was charged if the payment did not complete.";
}

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const payment = first(params.payment);
  const success = payment === "success";

  const trxId = first(params.trxId);
  const enrollmentId = first(params.enrollmentId);
  const status = first(params.status);
  const reason = first(params.reason);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment result"
        description="The status of your enrollment payment with bKash."
      />

      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <div
            className={`mb-2 inline-flex size-12 items-center justify-center rounded-full ${
              success
                ? "bg-success/15 text-success"
                : "bg-destructive/15 text-destructive"
            }`}
          >
            {success ? (
              <CircleCheck className="size-6" aria-hidden="true" />
            ) : (
              <CircleX className="size-6" aria-hidden="true" />
            )}
          </div>
          <CardTitle>
            {success
              ? "Payment successful"
              : payment
                ? "Payment failed"
                : "No payment to show"}
          </CardTitle>
          <CardDescription>
            {success
              ? "Your enrollment is confirmed once the payment settles."
              : payment
                ? reasonText(status, reason)
                : "This page has no payment result attached. Check the link you followed or go to your enrollments."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {success ? (
            <dl className="grid gap-3 rounded-lg border bg-muted/40 p-4 font-mono text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">
                  Transaction ID
                </dt>
                <dd className="mt-0.5 font-medium">{trxId ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Enrollment</dt>
                <dd className="mt-0.5 font-medium">
                  {enrollmentId ? enrollmentId.slice(0, 8).toUpperCase() : "-"}
                </dd>
              </div>
            </dl>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild className="flex-1">
              <Link href="/student/enrollments">View my enrollments</Link>
            </Button>
            {!success ? (
              <Button asChild variant="outline" className="flex-1">
                <Link href="/student/enroll">Try enrolling again</Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function first(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}
