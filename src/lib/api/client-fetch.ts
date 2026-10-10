import { ofetch, type FetchOptions } from "ofetch";
import type { ApiEnvelope } from "@/types/api";
import { ApiError, classifyAuthError } from "./errors";

/**
 * Browser HTTP client. It only ever talks to the same-origin proxy route, so
 * the backend URL and tokens never reach client code.
 */
export const apiClient = ofetch.create({
  baseURL: "/api/proxy",
  credentials: "include",
  ignoreResponseError: true,
  retry: 0,
});

export type ClientFetchOptions = Omit<FetchOptions, "baseURL" | "retry">;

export async function clientFetch<T>(
  path: string,
  options: ClientFetchOptions = {},
): Promise<ApiEnvelope<T>> {
  let response: Awaited<ReturnType<typeof apiClient.raw<T>>>;

  try {
    response = await apiClient.raw<T>(path, options);
  } catch {
    throw new ApiError(
      "We could not reach the server. Please try again.",
      0,
      "network",
    );
  }

  const body = response._data;

  if (body && body.success === false) {
    const kind = classifyAuthError(response.status, body.message);
    throw new ApiError(body.message, response.status, kind ?? "server");
  }

  if (!body) {
    throw new ApiError(
      response.statusText || "Something went wrong. Please try again.",
      response.status,
      "server",
    );
  }

  return body;
}

export async function clientFetchData<T>(
  path: string,
  options: ClientFetchOptions = {},
): Promise<T> {
  const envelope = await clientFetch<T>(path, options);
  return envelope.data;
}
