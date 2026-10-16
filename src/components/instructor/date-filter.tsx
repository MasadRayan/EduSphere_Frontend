"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function DateFilter({ paramKey = "date" }: { paramKey?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramKey) ?? "";

  const onChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(paramKey, value);
    } else {
      params.delete(paramKey);
    }
    params.delete("page");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  return (
    <input
      type="date"
      value={current}
      onChange={(event) => onChange(event.target.value)}
      aria-label="Show attendance for a specific date"
      className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs sm:w-44"
    />
  );
}
