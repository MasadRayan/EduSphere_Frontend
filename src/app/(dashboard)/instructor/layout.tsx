import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth/roles";

/**
 * Role guard for the instructor segment. The approval gate lives on each page
 * so the redirect is issued from a page segment. A redirect from this layout to
 * a sibling route fires mid-stream and loops the router on client navigations.
 */
export default async function InstructorLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole("INSTRUCTOR");
  return children;
}
