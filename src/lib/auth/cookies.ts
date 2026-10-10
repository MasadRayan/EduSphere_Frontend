import "server-only";
import type { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import type { AuthTokens } from "@/types/api";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  authCookieOptions,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
} from "./cookie-config";

export {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
} from "./cookie-config";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

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
