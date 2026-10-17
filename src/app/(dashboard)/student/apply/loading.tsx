import { Skeleton } from "@/components/ui/skeleton";

export default function StudentApplyLoading() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
      <Skeleton className="h-24 w-full max-w-2xl rounded-xl" />
      <div className="max-w-2xl rounded-xl bg-card py-4 text-sm ring-1 ring-foreground/10">
        <div className="space-y-2 px-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="mt-4 space-y-5 px-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-9 w-36" />
        </div>
      </div>
    </div>
  );
}
