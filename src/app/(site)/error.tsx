"use client";

import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";

export default function SiteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16">
      <ErrorState
        title="Something went wrong"
        description="We could not load this page. Please try again."
        action={
          <Button type="button" onClick={reset}>
            Try again
          </Button>
        }
      />
    </div>
  );
}
