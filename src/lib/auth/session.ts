import "server-only";
import { cache } from "react";
import { endpoints } from "@/lib/api/endpoints";
import { ApiError, isAuthFailureKind } from "@/lib/api/errors";
import { serverFetchData } from "@/lib/api/server-fetch";
import type { SessionUser } from "@/types/entities";

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
    return await serverFetchData<SessionUser>(endpoints.auth.me, {
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof ApiError && isAuthFailureKind(error.kind)) {
      return null;
    }
    throw error;
  }
});
