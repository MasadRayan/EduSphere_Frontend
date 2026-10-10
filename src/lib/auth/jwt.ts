import type { Role } from "@/types/enums";
import { isRole } from "./role-paths";

/**
 * Reads the `role` claim from an access token so an action or the route guard
 * can pick a dashboard without an extra round trip. This is a routing hint,
 * not an authorization decision: the destination layout and the backend still
 * enforce the real access check.
 */
export function decodeRoleFromAccessToken(token: string): Role | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { role?: unknown };
    return isRole(decoded.role) ? decoded.role : null;
  } catch {
    return null;
  }
}
