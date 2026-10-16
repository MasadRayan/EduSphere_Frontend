import { Skeleton } from "@/components/ui/skeleton";

export default function InstructorResultsLoading() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-10 w-44 rounded-md" />
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  );
}
