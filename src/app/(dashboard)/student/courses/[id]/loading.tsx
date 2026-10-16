import { Skeleton } from "@/components/ui/skeleton";

export default function StudentCourseDetailLoading() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <Skeleton className="h-8 w-72" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["stat-a", "stat-b", "stat-c", "stat-d"].map((key) => (
          <Skeleton key={key} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {["card-a", "card-b"].map((key) => (
          <Skeleton key={key} className="h-48 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
