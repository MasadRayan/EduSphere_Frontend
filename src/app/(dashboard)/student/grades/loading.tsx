import { Skeleton } from "@/components/ui/skeleton";

export default function StudentGradesLoading() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <Skeleton className="h-8 w-40" />
      <div className="grid gap-4 sm:grid-cols-3">
        {["stats-a", "stats-b", "stats-c"].map((key) => (
          <Skeleton key={key} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}
