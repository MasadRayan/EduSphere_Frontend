import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function TableSkeleton({
  rows = 6,
  columns = 4,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card",
        className,
      )}
      aria-hidden="true"
    >
      <div className="flex items-center gap-4 border-b border-border bg-muted/40 px-3 py-3">
        {Array.from({ length: columns }, (_, index) => `head-${index}`).map(
          (key) => (
            <Skeleton key={key} className="h-4 flex-1" />
          ),
        )}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }, (_, index) => `row-${index}`).map(
          (rowKey) => (
            <div key={rowKey} className="flex items-center gap-4 px-3 py-3.5">
              {Array.from(
                { length: columns },
                (_, index) => `cell-${index}`,
              ).map((cellKey) => (
                <Skeleton key={cellKey} className="h-4 flex-1" />
              ))}
            </div>
          ),
        )}
      </div>
    </div>
  );
}
