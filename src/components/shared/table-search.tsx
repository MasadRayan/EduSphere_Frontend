"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

export function TableSearch({
  placeholder = "Search",
  paramKey = "searchTerm",
  className,
}: {
  placeholder?: string;
  paramKey?: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initial = searchParams.get(paramKey) ?? "";
  const [value, setValue] = useState(initial);
  const debounced = useDebounce(value);
  const lastPushed = useRef(initial);

  useEffect(() => {
    if (debounced === lastPushed.current) {
      return;
    }
    lastPushed.current = debounced;

    const params = new URLSearchParams(searchParams.toString());
    if (debounced) {
      params.set(paramKey, debounced);
    } else {
      params.delete(paramKey);
    }
    params.delete("page");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [debounced, paramKey, pathname, router, searchParams]);

  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-8"
      />
    </div>
  );
}
