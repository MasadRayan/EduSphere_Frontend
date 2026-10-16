import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth/roles";

/**
 * Gated admission screens, reachable before the application is approved. Every
 * other instructor route redirects here until an approved profile exists.
 */
const GATED_ALLOWED_PATHS = new Set([
  "/instructor/apply",
  "/instructor/profile",
]);

export default async function InstructorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireRole("INSTRUCTOR");

  if (!user.instructorProfile) {
    const pathname = (await headers()).get("x-pathname") ?? "";
    if (!GATED_ALLOWED_PATHS.has(pathname)) {
      redirect("/instructor/apply");
    }
  }

  return children;
}
