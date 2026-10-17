import { Skeleton } from "@/components/ui/skeleton";

export default function DevUiLoading() {
  return (
    <div
      className="mx-auto w-full max-w-7xl space-y-8 px-4 py-12"
      aria-hidden="true"
    >
      <div className="space-y-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["stat-a", "stat-b", "stat-c", "stat-d"].map((key) => (
          <Skeleton key={key} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 w-full rounded-xl" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}
