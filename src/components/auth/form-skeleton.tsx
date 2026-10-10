import { Skeleton } from "@/components/ui/skeleton";

export function FormSkeleton({ google }: { google?: boolean }) {
  return (
    <div className="flex flex-col gap-5" aria-hidden="true">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-8 w-full" />
      </div>
      <Skeleton className="h-8 w-full" />
      {google ? <Skeleton className="h-8 w-full" /> : null}
    </div>
  );
}
