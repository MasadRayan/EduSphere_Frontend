import "server-only";
import { cookies } from "next/headers";
import { ofetch, type FetchOptions } from "ofetch";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, setAuthCookies } from "@/lib/auth/cookies";
import type { ApiEnvelope, AuthTokens } from "@/types/api";
import { endpoints } from "./endpoints";
import { ApiError, classifyAuthError } from "./errors";

const API_URL = process.env.API_URL;

if (!API_URL) {
  throw new Error("Missing API_URL environment variable");
}

const BASE_URL: string = API_URL;

export type ServerFetchOptions = Omit<
  FetchOptions,
  "baseURL" | "headers" | "retry"
> & {
  headers?: Record<string, string>;
  next?: { tags?: string[]; revalidate?: number | false };
};

function cookieHeaderFrom(entries: Array<{ name: string; value: string }>) {
  return entries.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
}

function upsertCookie(header: string, name: string, value: string): string {
  const parts = header
    .split("; ")
    .filter(Boolean)
    .filter((part) => !part.startsWith(`${name}=`));
  parts.push(`${name}=${value}`);
  return parts.join("; ");
}

async function requestRefresh(cookieHeader: string): Promise<AuthTokens | null> {
  const response = await ofetch.raw<ApiEnvelope<AuthTokens>>(
    endpoints.auth.refreshToken,
    {
      baseURL: BASE_URL,
      method: "POST",
      headers: { cookie: cookieHeader },
      ignoreResponseError: true,
    },
  );

  const tokens = response._data?.data;
  if (response.ok && tokens?.accessToken && tokens.refreshToken) {
    return tokens;
  }
  return null;
}

export async function serverFetch<T>(
  path: string,
  options: ServerFetchOptions = {},
): Promise<ApiEnvelope<T>> {
  const cookieStore = await cookies();
  let cookieHeader = cookieHeaderFrom(cookieStore.getAll());

  const run = (header: string) =>
    ofetch.raw<ApiEnvelope<T>>(path, {
      baseURL: BASE_URL,
      ignoreResponseError: true,
      ...options,
      headers: {
        ...options.headers,
        ...(header ? { cookie: header } : {}),
      },
    });

  let response: Awaited<ReturnType<typeof run>>;
  try {
    response = await run(cookieHeader);
  } catch {
    throw new ApiError(
      "We could not reach the server. Please try again.",
      0,
      "network",
    );
  }

  const kind = classifyAuthError(response.status, response._data?.message);

  if (kind === "unauthenticated" && cookieStore.has(REFRESH_TOKEN_COOKIE)) {
    const tokens = await requestRefresh(cookieHeader);

    if (tokens) {
      try {
        // Setting cookies is only allowed in Server Actions and Route Handlers.
        // During a Server Component render this throws and is safely ignored.
        setAuthCookies(cookieStore, tokens);
      } catch {
        // No-op: the proxy refresh covers plain renders.
      }

      cookieHeader = upsertCookie(
        cookieHeader,
        ACCESS_TOKEN_COOKIE,
        tokens.accessToken,
      );
      cookieHeader = upsertCookie(
        cookieHeader,
        REFRESH_TOKEN_COOKIE,
        tokens.refreshToken,
      );

      try {
        response = await run(cookieHeader);
      } catch {
        throw new ApiError(
          "We could not reach the server. Please try again.",
          0,
          "network",
        );
      }
    }
  }

  const body = response._data;

  if (body && body.success === false) {
    const errorKind = classifyAuthError(response.status, body.message);
    throw new ApiError(body.message, response.status, errorKind ?? "server");
  }

  if (!response.ok && !body) {
    throw new ApiError(
      response.statusText || "Something went wrong. Please try again.",
      response.status,
      "server",
    );
  }

  if (!body) {
    return {
      success: response.ok,
      statusCode: response.status,
      message: "",
      data: undefined as T,
    };
  }

  return body;
}

export async function serverFetchData<T>(
  path: string,
  options: ServerFetchOptions = {},
): Promise<T> {
  const envelope = await serverFetch<T>(path, options);
  return envelope.data;
}
