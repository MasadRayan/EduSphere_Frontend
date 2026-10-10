import { Compass } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <EmptyState
      icon={Compass}
      title="Page not found"
      description="This dashboard page does not exist or has moved."
      action={
        <Button asChild variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
      }
    />
  );
}
