import { FormSkeleton } from "@/components/auth/form-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthCardSkeleton({ google = false }: { google?: boolean }) {
  return (
    <div
      className="flex flex-col gap-6 rounded-xl bg-card py-4 text-sm ring-1 ring-foreground/10"
      aria-hidden="true"
    >
      <div className="flex flex-col gap-1 px-4">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="px-4">
        <FormSkeleton google={google} />
      </div>
      <div className="px-4">
        <Skeleton className="h-4 w-44" />
      </div>
    </div>
  );
}
