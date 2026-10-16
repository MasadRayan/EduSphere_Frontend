import { Skeleton } from "@/components/ui/skeleton";

export default function StudentGradeDetailLoading() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-8 w-72" />
      <div className="grid gap-4 sm:grid-cols-3">
        {["stats-a", "stats-b", "stats-c"].map((key) => (
          <Skeleton key={key} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  );
}
