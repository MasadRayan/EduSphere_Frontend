"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh items-center justify-center bg-background p-6 text-foreground">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="font-display text-2xl font-semibold">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground">
            An unexpected error stopped the page from loading. Please try again.
          </p>
          <Button onClick={reset}>Try again</Button>
        </div>
      </body>
    </html>
  );
}
