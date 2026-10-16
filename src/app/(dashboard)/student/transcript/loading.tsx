import { Skeleton } from "@/components/ui/skeleton";

export default function StudentTranscriptLoading() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-9 w-52 rounded-md" />
      </div>
      <Skeleton className="h-10 w-44 rounded-md" />
      <div className="grid gap-4 sm:grid-cols-3">
        {["stats-a", "stats-b", "stats-c"].map((key) => (
          <Skeleton key={key} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  );
}
