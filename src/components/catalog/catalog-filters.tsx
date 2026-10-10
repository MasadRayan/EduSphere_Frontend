"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TableSearch } from "@/components/shared/table-search";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_DEPARTMENTS = "all";

export function CatalogFilters({
  departments,
  searchPlaceholder,
}: {
  departments: { id: string; name: string; code: string }[];
  searchPlaceholder: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("departmentId") ?? ALL_DEPARTMENTS;

  const onDepartmentChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === ALL_DEPARTMENTS) {
      params.delete("departmentId");
    } else {
      params.set("departmentId", value);
    }
    params.delete("page");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Select value={current} onValueChange={onDepartmentChange}>
        <SelectTrigger
          className="w-full sm:w-64"
          aria-label="Filter by department"
        >
          <SelectValue placeholder="All departments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_DEPARTMENTS}>All departments</SelectItem>
          {departments.map((department) => (
            <SelectItem key={department.id} value={department.id}>
              {department.name} ({department.code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <TableSearch
        placeholder={searchPlaceholder}
        className="w-full sm:max-w-xs"
      />
    </div>
  );
}
