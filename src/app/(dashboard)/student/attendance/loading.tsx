import { Skeleton } from "@/components/ui/skeleton";

export default function StudentAttendanceLoading() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <Skeleton className="h-8 w-40" />
      <div className="grid gap-4 sm:grid-cols-3">
        {["stats-a", "stats-b", "stats-c"].map((key) => (
          <Skeleton key={key} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {["group-a", "group-b", "group-c", "group-d"].map((key) => (
          <Skeleton key={key} className="h-64 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
