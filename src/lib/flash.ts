import type { cookies } from "next/headers";

export type FlashType = "success" | "error" | "info" | "warning";

export interface Flash {
  type: FlashType;
  message: string;
  description?: string;
}

export const FLASH_COOKIE = "es_flash";
export const FLASH_MAX_AGE = 60;

type CookieStore = Awaited<ReturnType<typeof cookies>>;

export function serializeFlash(flash: Flash): string {
  return JSON.stringify(flash);
}

export function parseFlash(raw: string): Flash | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }

  try {
    const parsed = JSON.parse(decoded) as Partial<Flash>;
    if (
      typeof parsed.message !== "string" ||
      (parsed.type !== "success" &&
        parsed.type !== "error" &&
        parsed.type !== "info" &&
        parsed.type !== "warning")
    ) {
      return null;
    }
    return {
      type: parsed.type,
      message: parsed.message,
      description: parsed.description,
    };
  } catch {
    return null;
  }
}

export function setFlash(store: CookieStore, flash: Flash): void {
  store.set(FLASH_COOKIE, serializeFlash(flash), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: FLASH_MAX_AGE,
  });
}

/**
 * Reads and immediately clears the flash cookie in the browser. The cookie is
 * written as non-httpOnly so a redirect (which the server cannot hook) can hand
 * a one-time message to the client.
 */
export function consumeFlashCookie(): Flash | null {
  if (typeof document === "undefined") {
    return null;
  }

  const entry = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${FLASH_COOKIE}=`));

  // biome-ignore lint/suspicious/noDocumentCookie: clearing a one-time, non-httpOnly flash message
  document.cookie = `${FLASH_COOKIE}=; path=/; max-age=0; samesite=lax`;

  if (!entry) {
    return null;
  }

  return parseFlash(entry.slice(FLASH_COOKIE.length + 1));
}
