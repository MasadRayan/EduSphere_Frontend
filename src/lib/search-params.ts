export type SearchParamsInput = Record<string, string | string[] | undefined>;

export function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

/**
 * Reads a repeated query param such as `?courseId=a&courseId=b`. Empty values
 * are dropped and duplicates are removed so a hand-edited URL cannot submit the
 * same course twice.
 */
export function allParams(value: string | string[] | undefined): string[] {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return [...new Set(values.map((item) => item.trim()).filter(Boolean))];
}

export function readPage(value: string | string[] | undefined): number {
  const raw = firstParam(value);
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
}
