import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth/roles";

export default async function InstructorLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole("INSTRUCTOR");
  return children;
}
