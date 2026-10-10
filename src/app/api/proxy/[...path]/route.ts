import { type NextRequest, NextResponse } from "next/server";
import { endpoints, PROXY_ALLOWED_PREFIXES } from "@/lib/api/endpoints";
import { classifyAuthError } from "@/lib/api/errors";
import {
  ACCESS_TOKEN_COOKIE,
  clearAuthCookiesOnResponse,
  REFRESH_TOKEN_COOKIE,
  setAuthCookiesOnResponse,
} from "@/lib/auth/cookies";
import type { ApiEnvelope, AuthTokens } from "@/types/api";

const API_URL = process.env.API_URL;

if (!API_URL) {
  throw new Error("Missing API_URL environment variable");
}

const BASE_URL: string = API_URL;

interface ProxyContext {
  params: Promise<{ path: string[] }>;
}

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const REQUEST_STRIPPED = new Set([
  ...HOP_BY_HOP,
  "host",
  "cookie",
  "authorization",
  "content-length",
  "accept-encoding",
]);

const RESPONSE_STRIPPED = new Set([
  ...HOP_BY_HOP,
  "content-encoding",
  "content-length",
  "set-cookie",
]);

function isAllowedPath(pathname: string): boolean {
  if (pathname.startsWith("/api/proxy")) {
    return false;
  }
  return PROXY_ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function parseCookie(header: string | null): Record<string, string> {
  if (!header) {
    return {};
  }
  return header.split(";").reduce<Record<string, string>>((acc, part) => {
    const separator = part.indexOf("=");
    if (separator === -1) {
      return acc;
    }
    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (name) {
      acc[name] = value;
    }
    return acc;
  }, {});
}

function filterHeaders(source: Headers, stripped: Set<string>): Headers {
  const headers = new Headers();
  source.forEach((value, key) => {
    if (!stripped.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });
  return headers;
}

async function requestRefresh(
  cookieHeader: string,
): Promise<AuthTokens | null> {
  try {
    const response = await fetch(`${BASE_URL}${endpoints.auth.refreshToken}`, {
      method: "POST",
      headers: { cookie: cookieHeader },
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

function buildUpstreamHeaders(
  request: NextRequest,
  accessToken: string | undefined,
): Headers {
  const headers = filterHeaders(request.headers, REQUEST_STRIPPED);
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }
  if (accessToken) {
    headers.set("authorization", `Bearer ${accessToken}`);
  }
  return headers;
}

function buildInit(request: NextRequest, headers: Headers): RequestInit {
  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";
  const init: RequestInit & { duplex?: "half" } = {
    method,
    headers,
    body: hasBody ? request.body : undefined,
    redirect: "manual",
    cache: "no-store",
  };
  if (hasBody) {
    init.duplex = "half";
  }
  return init;
}

async function forward(request: NextRequest, pathname: string) {
  const search = new URL(request.url).search;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const headers = buildUpstreamHeaders(request, accessToken);
  const init = buildInit(request, headers);
  const target = `${BASE_URL}${pathname}${search}`;

  return fetch(target, init);
}

function toClientResponse(
  upstream: Response,
  tokens?: AuthTokens,
): NextResponse {
  const headers = filterHeaders(upstream.headers, RESPONSE_STRIPPED);
  const response = new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
  if (tokens) {
    setAuthCookiesOnResponse(response, tokens);
  }
  return response;
}

const ERROR_BODY_KEYS = [
  "success",
  "statusCode",
  "message",
  "data",
  "errors",
  "errorSources",
  "errorDetails",
] as const;

/**
 * Rewrites a backend error body to only the fields the UI needs. This stops
 * internal details (stack traces, error names, filesystem paths) from reaching
 * the browser while keeping the user-facing message and validation errors.
 */
function sanitizeErrorBody(raw: string, status: number): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = undefined;
  }

  const fallbackMessage =
    status >= 500
      ? "Something went wrong on our end. Please try again."
      : "Request failed. Please check your input and try again.";

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return JSON.stringify({
      success: false,
      statusCode: status,
      message: fallbackMessage,
      data: null,
    });
  }

  const source = parsed as Record<string, unknown>;
  const clean: Record<string, unknown> = {};
  for (const key of ERROR_BODY_KEYS) {
    if (key in source) {
      clean[key] = source[key];
    }
  }
  if (typeof clean.success !== "boolean") {
    clean.success = false;
  }
  clean.statusCode = status;
  if (typeof clean.message !== "string" || clean.message.length === 0) {
    clean.message = fallbackMessage;
  }
  return JSON.stringify(clean);
}

function errorResponse(
  raw: string,
  status: number,
  upstreamHeaders: Headers,
  tokens?: AuthTokens,
): NextResponse {
  const headers = filterHeaders(upstreamHeaders, RESPONSE_STRIPPED);
  headers.set("content-type", "application/json; charset=utf-8");
  const response = new NextResponse(sanitizeErrorBody(raw, status), {
    status,
    headers,
  });
  if (tokens) {
    setAuthCookiesOnResponse(response, tokens);
  }
  return response;
}

function parseMessage(raw: string): string | undefined {
  try {
    return (JSON.parse(raw) as { message?: string }).message;
  } catch {
    return undefined;
  }
}

async function forwardWithRefresh(
  request: NextRequest,
  pathname: string,
): Promise<NextResponse> {
  let upstream = await forward(request, pathname);
  const status = upstream.status;

  if (status < 400) {
    return toClientResponse(upstream);
  }

  if (status !== 401 && status !== 403 && status !== 500) {
    const raw = await upstream.text();
    return errorResponse(raw, status, upstream.headers);
  }

  const raw = await upstream.text();
  const message = parseMessage(raw);
  const kind = classifyAuthError(status, message);
  const cookies = parseCookie(request.headers.get("cookie"));
  const refreshToken = cookies[REFRESH_TOKEN_COOKIE];

  if (kind !== "unauthenticated" || !refreshToken) {
    return errorResponse(raw, status, upstream.headers);
  }

  const refreshCookieHeader = `${REFRESH_TOKEN_COOKIE}=${refreshToken}`;
  const tokens = await requestRefresh(refreshCookieHeader);

  if (!tokens) {
    const response = errorResponse(raw, 401, upstream.headers);
    clearAuthCookiesOnResponse(response);
    return response;
  }

  const headers = buildUpstreamHeaders(request, tokens.accessToken);
  const init = buildInit(request, headers);
  const search = new URL(request.url).search;
  upstream = await fetch(`${BASE_URL}${pathname}${search}`, init);

  if (upstream.status >= 400) {
    const replayedRaw = await upstream.text();
    return errorResponse(
      replayedRaw,
      upstream.status,
      upstream.headers,
      tokens,
    );
  }

  return toClientResponse(upstream, tokens);
}

export async function GET(request: NextRequest, context: ProxyContext) {
  const { path } = await context.params;
  return handle(request, path);
}

export async function POST(request: NextRequest, context: ProxyContext) {
  const { path } = await context.params;
  return handle(request, path);
}

export async function PUT(request: NextRequest, context: ProxyContext) {
  const { path } = await context.params;
  return handle(request, path);
}

export async function PATCH(request: NextRequest, context: ProxyContext) {
  const { path } = await context.params;
  return handle(request, path);
}

export async function DELETE(request: NextRequest, context: ProxyContext) {
  const { path } = await context.params;
  return handle(request, path);
}

async function handle(request: NextRequest, path: string[]) {
  const pathname = `/${path.join("/")}`;

  if (!isAllowedPath(pathname)) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 403,
        message: "This path is not allowed through the proxy.",
        data: null,
      },
      { status: 403 },
    );
  }

  try {
    return await forwardWithRefresh(request, pathname);
  } catch {
    return NextResponse.json(
      {
        success: false,
        statusCode: 502,
        message: "We could not reach the server. Please try again.",
        data: null,
      },
      { status: 502 },
    );
  }
}
