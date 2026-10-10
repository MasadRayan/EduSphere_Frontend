"use client";

import { cn } from "cn";
import { Check, X } from "lucide-react";

const RULES: { label: string; test: (value: string) => boolean }[] = [
  { label: "8+ characters", test: (value) => value.length >= 8 },
  { label: "Uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { label: "Lowercase letter", test: (value) => /[a-z]/.test(value) },
  { label: "Number", test: (value) => /[0-9]/.test(value) },
  { label: "Special character", test: (value) => /[^A-Za-z0-9]/.test(value) },
];

export function PasswordRules({ value }: { value: string }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
      {RULES.map((rule) => {
        const met = value.length > 0 && rule.test(value);
        return (
          <li
            key={rule.label}
            className={cn(
              "flex items-center gap-1.5",
              met ? "text-primary" : "text-muted-foreground",
            )}
          >
            {met ? (
              <Check className="size-3.5" aria-hidden="true" />
            ) : (
              <X className="size-3.5" aria-hidden="true" />
            )}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
