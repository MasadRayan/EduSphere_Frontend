import { Skeleton } from "@/components/ui/skeleton";

export function SiteHeaderSkeleton() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-4 px-4">
        <Skeleton className="size-8 rounded-lg" />
        <Skeleton className="h-4 w-24" />
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="hidden h-8 w-28 rounded-md md:block" />
        </div>
      </div>
    </header>
  );
}
