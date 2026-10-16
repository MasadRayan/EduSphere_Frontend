import { Skeleton } from "@/components/ui/skeleton";

export default function StudentCoursesLoading() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}
