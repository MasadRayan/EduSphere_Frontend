import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth/roles";

/**
 * Gated admission screens, reachable before the application is approved. Every
 * other student route redirects here until an approved profile exists.
 */
const GATED_ALLOWED_PATHS = new Set(["/student/apply", "/student/profile"]);

export default async function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireRole("STUDENT");

  if (!user.studentProfile) {
    const pathname = (await headers()).get("x-pathname") ?? "";
    if (!GATED_ALLOWED_PATHS.has(pathname)) {
      redirect("/student/apply");
    }
  }

  return children;
}
