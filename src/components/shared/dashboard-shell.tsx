import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getSession } from "@/lib/auth/session";
import type { NavUser } from "@/lib/nav";
import { AppSidebar } from "./app-sidebar";
import { Topbar } from "./topbar";

export async function DashboardShell({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user: NavUser = {
    name: session.name,
    email: session.email,
    role: session.role,
    avatarUrl: session.avatarUrl,
  };

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <Topbar user={user} />
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
