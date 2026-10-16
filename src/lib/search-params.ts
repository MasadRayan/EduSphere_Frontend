export type SearchParamsInput = Record<string, string | string[] | undefined>;

export function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function readPage(value: string | string[] | undefined): number {
  const raw = firstParam(value);
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
}
