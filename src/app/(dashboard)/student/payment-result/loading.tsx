import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentResultLoading() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="mx-auto w-full max-w-xl rounded-xl bg-card py-4 ring-1 ring-foreground/10">
        <div className="space-y-3 px-4">
          <Skeleton className="size-12 rounded-full" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full max-w-sm" />
        </div>
        <div className="mt-4 space-y-4 px-4">
          <Skeleton className="h-20 w-full rounded-lg" />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
