import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth/roles";

export default async function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole("STUDENT");
  return children;
}
