"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/lib/auth/actions";

export function LogoutMenuItem() {
  const [pending, startTransition] = useTransition();

  return (
    <DropdownMenuItem
      disabled={pending}
      onSelect={(event) => {
        event.preventDefault();
        startTransition(() => {
          void logoutAction();
        });
      }}
    >
      <LogOut className="size-4" aria-hidden="true" />
      {pending ? "Logging out..." : "Log out"}
    </DropdownMenuItem>
  );
}

export function LogoutButton({ className }: { className?: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      className={className}
      onClick={() => {
        startTransition(() => {
          void logoutAction();
        });
      }}
    >
      <LogOut aria-hidden="true" />
      {pending ? "Logging out..." : "Log out"}
    </Button>
  );
}
