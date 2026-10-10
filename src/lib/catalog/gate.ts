import { ApiError, isAuthFailureKind } from "@/lib/api/errors";

/**
 * The catalog reads require an authenticated session (any role). When the
 * backend rejects a request with an auth failure we render the sign-in gate
 * instead of the error boundary, so the page still works if the routes are
 * ever opened up to anonymous visitors.
 */
export function isCatalogGated(error: unknown): boolean {
  return error instanceof ApiError && isAuthFailureKind(error.kind);
}
