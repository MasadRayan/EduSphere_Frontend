"use client";

import { LayoutDashboard, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogoutButton } from "@/components/auth/logout";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ROLE_LABEL } from "@/lib/nav";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/enums";
import { AvatarWithFallback } from "./avatar-with-fallback";
import { isActiveLink } from "./site-nav";

export interface MobileNavUser {
  name: string;
  email: string;
  avatarUrl: string | null;
  role: Role;
}

export function MobileNav({
  links,
  accountHref,
  accountLabel,
  user,
}: {
  links: { label: string; href: string }[];
  accountHref: string;
  accountLabel: string;
  user: MobileNavUser | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        {user ? (
          <div className="flex items-center gap-3 border-b border-border px-4 pt-4 pr-12 pb-4">
            <AvatarWithFallback
              name={user.name}
              src={user.avatarUrl}
              size="lg"
            />
            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate">{user.name}</SheetTitle>
              <SheetDescription className="truncate text-xs">
                {user.email}
              </SheetDescription>
              <span className="mt-1 block font-mono text-[10px] tracking-[0.16em] text-primary uppercase">
                {ROLE_LABEL[user.role]}
              </span>
            </div>
          </div>
        ) : (
          <SheetHeader className="pr-12">
            <SheetTitle className="font-display">EduSphere</SheetTitle>
            <SheetDescription className="text-xs">Site menu</SheetDescription>
          </SheetHeader>
        )}
        <nav className="flex flex-col gap-1 px-4">
          {links.map((link) => {
            const active = isActiveLink(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium outline-hidden hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
                  active && "bg-muted text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <SheetFooter>
          {user ? (
            <>
              <Button asChild onClick={() => setOpen(false)}>
                <Link href={accountHref}>
                  <LayoutDashboard className="size-4" aria-hidden="true" />
                  {accountLabel}
                </Link>
              </Button>
              <LogoutButton className="w-full" />
            </>
          ) : (
            <>
              <Button asChild variant="outline" onClick={() => setOpen(false)}>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild onClick={() => setOpen(false)}>
                <Link href="/register">Create account</Link>
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
