import "server-only";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import type { AuthTokens } from "@/types/api";

export const ACCESS_TOKEN_COOKIE = "accessToken";
export const REFRESH_TOKEN_COOKIE = "refreshToken";

export const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24;
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

type CookieStore = Awaited<ReturnType<typeof cookies>>;

function authCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function getAccessToken(store: CookieStore): string | undefined {
  return store.get(ACCESS_TOKEN_COOKIE)?.value;
}

export function getRefreshToken(store: CookieStore): string | undefined {
  return store.get(REFRESH_TOKEN_COOKIE)?.value;
}

export function setAuthCookies(store: CookieStore, tokens: AuthTokens): void {
  store.set(
    ACCESS_TOKEN_COOKIE,
    tokens.accessToken,
    authCookieOptions(ACCESS_TOKEN_MAX_AGE),
  );
  store.set(
    REFRESH_TOKEN_COOKIE,
    tokens.refreshToken,
    authCookieOptions(REFRESH_TOKEN_MAX_AGE),
  );
}

export function clearAuthCookies(store: CookieStore): void {
  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
}

export function setAuthCookiesOnResponse(
  response: NextResponse,
  tokens: AuthTokens,
): void {
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
}

export function clearAuthCookiesOnResponse(response: NextResponse): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
}
