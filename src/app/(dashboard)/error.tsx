"use client";

import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="This page could not load"
      description="Something went wrong while loading your data. Please try again."
      action={<Button onClick={reset}>Try again</Button>}
    />
  );
}
