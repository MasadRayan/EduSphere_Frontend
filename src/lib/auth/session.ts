import "server-only";
import { cache } from "react";
import { endpoints } from "@/lib/api/endpoints";
import { ApiError, isAuthFailureKind } from "@/lib/api/errors";
import { serverFetchData } from "@/lib/api/server-fetch";
import type { SessionUser } from "@/types/entities";

/**
 * The backend keeps the profile photo on studentProfile/instructorProfile and
 * the user level photo on imageURL. Resolve the first one that has a value so
 * every screen can read a single session.avatarUrl.
 */
function resolveAvatarUrl(user: SessionUser): string | null {
  const candidates = [
    user.studentProfile?.avatarUrl,
    user.instructorProfile?.avatarUrl,
    user.imageURL,
  ];
  for (const candidate of candidates) {
    if (candidate) {
      return candidate;
    }
  }
  return null;
}

/**
 * Reads the current session from the backend. Cached per request so a layout
 * and a page do not trigger duplicate /api/auth/me calls.
 *
 * Returns null when the visitor is not authenticated (or their session can no
 * longer be used). Network and server failures are rethrown so callers can
 * show an error state instead of silently treating the user as logged out.
 */
export const getSession = cache(async (): Promise<SessionUser | null> => {
  try {
    const user = await serverFetchData<SessionUser>(endpoints.auth.me, {
      cache: "no-store",
    });
    return { ...user, avatarUrl: resolveAvatarUrl(user) };
  } catch (error) {
    if (error instanceof ApiError && isAuthFailureKind(error.kind)) {
      return null;
    }
    throw error;
  }
});
