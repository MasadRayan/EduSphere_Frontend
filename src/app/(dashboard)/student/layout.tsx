import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth/roles";

/**
 * Role guard for the student segment. The approval gate lives on each page so
 * the redirect is issued from a page segment. A redirect from this layout to a
 * sibling route fires mid-stream and loops the router on client navigations.
 */
export default async function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole("STUDENT");
  return children;
}
