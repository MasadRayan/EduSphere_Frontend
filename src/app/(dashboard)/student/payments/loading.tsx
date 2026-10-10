import { Skeleton } from "@/components/ui/skeleton";

export default function StudentPaymentsLoading() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <Skeleton className="h-8 w-56" />
      <div className="grid gap-4 sm:grid-cols-2">
        {["stats-a", "stats-b"].map((key) => (
          <Skeleton key={key} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}