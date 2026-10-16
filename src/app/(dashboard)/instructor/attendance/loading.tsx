import { Skeleton } from "@/components/ui/skeleton";

export default function InstructorAttendanceLoading() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-3">
        {["a-a", "a-b", "a-c"].map((key) => (
          <Skeleton key={key} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-10 w-44 rounded-md" />
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}
