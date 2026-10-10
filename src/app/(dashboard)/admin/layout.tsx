import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth/roles";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole("ADMIN", "SUPER_ADMIN");
  return children;
}
