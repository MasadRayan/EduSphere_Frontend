import { Skeleton } from "@/components/ui/skeleton";

export default function StudentDashboardLoading() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-10 w-44 rounded-md" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["stats-a", "stats-b", "stats-c", "stats-d"].map((key) => (
          <Skeleton key={key} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 w-full rounded-xl lg:col-span-2" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {["charts-a", "charts-b"].map((key) => (
          <Skeleton key={key} className="h-60 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
