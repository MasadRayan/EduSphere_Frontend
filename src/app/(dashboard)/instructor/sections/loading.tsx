import { Skeleton } from "@/components/ui/skeleton";

export default function InstructorSectionsLoading() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <Skeleton className="h-8 w-52" />
      <div className="grid gap-4 sm:grid-cols-3">
        {["s-a", "s-b", "s-c"].map((key) => (
          <Skeleton key={key} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-10 w-44 rounded-md" />
      <div className="grid gap-4 lg:grid-cols-2">
        {["card-a", "card-b", "card-c", "card-d"].map((key) => (
          <Skeleton key={key} className="h-64 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
