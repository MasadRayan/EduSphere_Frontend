import { CatalogListSkeleton } from "@/components/catalog/catalog-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProgramsLoading() {
  return (
    <div className="flex flex-col">
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl space-y-4 px-4 py-16 md:py-20">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full max-w-xl" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>
      </section>
      <section>
        <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-12">
          <Skeleton className="h-10 w-full max-w-md" />
          <CatalogListSkeleton />
        </div>
      </section>
    </div>
  );
}
