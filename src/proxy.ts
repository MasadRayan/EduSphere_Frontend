import { type NextRequest, NextResponse } from "next/server";
import { endpoints } from "@/lib/api/endpoints";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  authCookieOptions,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
} from "@/lib/auth/cookie-config";
import { decodeRoleFromAccessToken } from "@/lib/auth/jwt";
import { homePathForRole } from "@/lib/auth/role-paths";
import type { ApiEnvelope, AuthTokens } from "@/types/api";

const API_URL = process.env.API_URL;

/**
 * Pages that only make sense to a signed-out visitor. A visitor with an access
 * token is bounced to their role dashboard instead.
 */
const AUTH_PAGES = new Set([
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
]);

async function refreshSession(
  refreshToken: string,
): Promise<AuthTokens | null> {
  if (!API_URL) {
    return null;
  }
  try {
    const response = await fetch(`${API_URL}${endpoints.auth.refreshToken}`, {
      method: "POST",
      headers: { cookie: `${REFRESH_TOKEN_COOKIE}=${refreshToken}` },
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    const body = (await response.json()) as ApiEnvelope<AuthTokens>;
    const tokens = body.data;
    if (tokens?.accessToken && tokens.refreshToken) {
      return tokens;
    }
    return null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const isAuthPage = AUTH_PAGES.has(pathname);

  if (accessToken) {
    if (isAuthPage) {
      const role = decodeRoleFromAccessToken(accessToken);
      const destination = role ? homePathForRole(role) : "/";
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return NextResponse.next();
  }

  if (isAuthPage) {
    return NextResponse.next();
  }

  if (refreshToken) {
    const tokens = await refreshSession(refreshToken);
    if (tokens) {
      const response = NextResponse.next();
      response.cookies.set(
        ACCESS_TOKEN_COOKIE,
        tokens.accessToken,
        authCookieOptions(ACCESS_TOKEN_MAX_AGE),
      );
      response.cookies.set(
        REFRESH_TOKEN_COOKIE,
        tokens.refreshToken,
        authCookieOptions(REFRESH_TOKEN_MAX_AGE),
      );
      return response;
    }
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/student/:path*",
    "/instructor/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
  ],
};
