import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardShellSkeleton() {
  return (
    <SidebarProvider>
      <div className="hidden w-64 shrink-0 border-r border-border bg-sidebar p-3 md:block">
        <Skeleton className="mb-4 h-9 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 8 }, (_, index) => `nav-${index}`).map(
            (key) => (
              <Skeleton key={key} className="h-8 w-full" />
            ),
          )}
        </div>
      </div>
      <SidebarInset>
        <div className="flex h-14 items-center gap-2 border-b border-border px-3">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <Skeleton className="h-8 w-56" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => `stat-${index}`).map(
              (key) => (
                <Skeleton key={key} className="h-28 w-full rounded-xl" />
              ),
            )}
          </div>
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
