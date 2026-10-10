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
