import "server-only";
import type { ZodError } from "zod";
import { ApiError } from "@/lib/api/errors";
import type { ActionResult } from "@/types/api";

/** Shared shape for every Server Action form state. */
export type FormState = ActionResult<null> | undefined;

/** Flattens a Zod error into the field-error map the forms render. */
export function fieldErrorsFrom(error: ZodError): Record<string, string[]> {
  const flat = error.flatten().fieldErrors;
  const result: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(flat)) {
    if (value?.length) {
      result[key] = value;
    }
  }
  return result;
}

/** Prefers the backend's message and falls back to a friendly default. */
export function messageFrom(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  return fallback;
}

/** Reads a string field from FormData, treating missing values as empty. */
export function readString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}
