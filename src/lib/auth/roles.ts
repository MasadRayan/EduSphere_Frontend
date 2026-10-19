import "server-only";
import { redirect } from "next/navigation";
import type { SessionUser } from "@/types/entities";
import type { Role } from "@/types/enums";
import { homePathForRole } from "./role-paths";
import { getSession } from "./session";

export { homePathForRole, isRole, ROLE_HOME } from "./role-paths";

/**
 * Layout-level guard. Every role segment calls this so a wrong role is
 * redirected to its own dashboard even if the route guard was bypassed.
 * The backend still performs the real authorization.
 */
export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  if (!roles.includes(user.role)) {
    redirect(homePathForRole(user.role));
  }

  return user;
}

/**
 * Page-level approval gate. A student without an approved profile only sees the
 * application and profile screens. This lives on each page, not the segment
 * layout: a layout redirect to a sibling route fires mid-stream on a client
 * navigation and makes the router refetch the target forever.
 */
export async function requireStudentProfile(): Promise<SessionUser> {
  const user = await requireRole("STUDENT");

  if (!user.studentProfile) {
    redirect("/student/apply");
  }

  return user;
}

/** Instructor equivalent of {@link requireStudentProfile}. */
export async function requireInstructorProfile(): Promise<SessionUser> {
  const user = await requireRole("INSTRUCTOR");

  if (!user.instructorProfile) {
    redirect("/instructor/apply");
  }

  return user;
}
