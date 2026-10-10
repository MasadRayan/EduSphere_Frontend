import { type ReactNode, Suspense } from "react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { DashboardShellSkeleton } from "@/components/shared/dashboard-shell-skeleton";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<DashboardShellSkeleton />}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
