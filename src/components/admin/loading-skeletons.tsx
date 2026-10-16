import { Skeleton } from "@/components/ui/skeleton";

function StatGrid({
  count,
  columnsClass,
}: {
  count: number;
  columnsClass: string;
}) {
  const cells = Array.from(
    { length: count },
    (_, index) => `stat-${columnsClass}-${index}`,
  );
  return (
    <div className={columnsClass} aria-hidden="true">
      {cells.map((cell) => (
        <Skeleton key={cell} className="h-28 w-full rounded-xl" />
      ))}
    </div>
  );
}

/** Header, filters matching the page, then a table block. */
export function TableLoading({
  statCards = "single",
}: {
  /** "single" = one compact card, "double" = two cards, "none". */
  statCards?: "single" | "double" | "none";
}) {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
      {statCards === "single" ? (
        <Skeleton className="h-28 w-full rounded-xl sm:max-w-xs" />
      ) : null}
      {statCards === "double" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-9 w-64 rounded-md" />
        <Skeleton className="h-9 w-44 rounded-md" />
        <Skeleton className="h-9 w-44 rounded-md" />
      </div>
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}

/** Dashboard layout: header, two stat rows and a two-column chart grid. */
export function DashboardLoading() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-96" />
      </div>
      <StatGrid
        count={4}
        columnsClass="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      />
      <StatGrid
        count={4}
        columnsClass="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    </div>
  );
}

/** Analytics layout: header, filters, three stat rows, charts. */
export function AnalyticsLoading() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-9 w-44 rounded-md" />
        <Skeleton className="h-11 w-52 rounded-lg" />
      </div>
      <StatGrid
        count={4}
        columnsClass="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      />
      <StatGrid
        count={4}
        columnsClass="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      />
      <StatGrid
        count={3}
        columnsClass="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    </div>
  );
}

/** Applications layout: header, three status cards, filter, table. */
export function ApplicationsLoading() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <StatGrid count={3} columnsClass="grid gap-4 sm:grid-cols-3" />
      <Skeleton className="h-9 w-44 rounded-md" />
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}
