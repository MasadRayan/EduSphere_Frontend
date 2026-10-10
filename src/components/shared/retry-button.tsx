"use client";

import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RetryButton({ onRetry }: { onRetry: () => void }) {
  return (
    <Button type="button" onClick={onRetry}>
      <RotateCw aria-hidden="true" />
      Try again
    </Button>
  );
}
