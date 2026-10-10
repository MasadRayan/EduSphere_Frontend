import { Lock } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export function CatalogGate({
  nextPath,
  what,
}: {
  nextPath: string;
  what: string;
}) {
  const next = encodeURIComponent(nextPath);

  return (
    <EmptyState
      icon={Lock}
      title="Sign in to browse the catalog"
      description={`${what} are part of your EduSphere record. Log in to explore the full catalog, including prerequisites and credit weights.`}
      action={
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link href={`/login?next=${next}`}>Log in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/register">Create account</Link>
          </Button>
        </div>
      }
    />
  );
}
