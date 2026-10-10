/**
 * Validates a `next` redirect target so it can only be a same-origin relative
 * path. Prevents open redirects from attacker-controlled query strings.
 */
export function safeNext(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  if (!value.startsWith("/")) {
    return null;
  }
  if (value.startsWith("//") || value.startsWith("/\\")) {
    return null;
  }
  if (value.includes("\\")) {
    return null;
  }
  return value;
}
