export type AuthFailureKind =
  | "unauthenticated"
  | "forbidden"
  | "blocked"
  | "deleted"
  | "credentials";

export type ApiErrorKind = AuthFailureKind | "network" | "server" | "unknown";

const AUTH_FAILURE_MESSAGES: Record<string, AuthFailureKind> = {
  "You are not logged in. Please log in to access this resource.":
    "unauthenticated",
  "Forbidden. You don't have permission to access this resource.": "forbidden",
  "Your account is blocked. Please contact the administration.": "blocked",
  "User is deleted. Please contact support.": "deleted",
  "User credentials mismatch. Please log in again.": "credentials",
};

export class ApiError extends Error {
  readonly status: number;
  readonly kind: ApiErrorKind;

  constructor(message: string, status: number, kind: ApiErrorKind = "unknown") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.kind = kind;
  }
}

/**
 * Classifies a backend failure into an auth-aware kind. Handles both proper
 * 401/403 responses and the backend auth-middleware quirk where session
 * failures are reported as HTTP 500 with a known message.
 */
export function classifyAuthError(
  status: number,
  message: string | undefined,
): AuthFailureKind | null {
  if (message) {
    const byMessage = AUTH_FAILURE_MESSAGES[message];
    if (byMessage) {
      return byMessage;
    }
  }

  if (status === 401) {
    return "unauthenticated";
  }

  if (status === 403) {
    return "forbidden";
  }

  return null;
}

export function isAuthError(error: unknown): error is ApiError {
  return error instanceof ApiError && isAuthFailureKind(error.kind);
}

export function isAuthFailureKind(kind: ApiErrorKind): kind is AuthFailureKind {
  return (
    kind === "unauthenticated" ||
    kind === "forbidden" ||
    kind === "blocked" ||
    kind === "deleted" ||
    kind === "credentials"
  );
}

export const AUTH_ERROR_COPY: Record<AuthFailureKind, string> = {
  unauthenticated: "Your session has expired. Please log in again.",
  forbidden: "You do not have permission to view this.",
  blocked: "Your account is blocked. Please contact the administration.",
  deleted: "This account has been deleted. Please contact support.",
  credentials: "Your credentials changed. Please log in again.",
};
