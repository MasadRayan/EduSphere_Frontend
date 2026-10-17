"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogoutButton } from "@/components/auth/logout";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { isActiveLink } from "./site-nav";

export function MobileNav({
  links,
  accountHref,
  accountLabel,
  showAuthActions,
  isAuthenticated,
}: {
  links: { label: string; href: string }[];
  accountHref: string;
  accountLabel: string;
  showAuthActions: boolean;
  isAuthenticated: boolean;
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
        <SheetHeader>
          <SheetTitle className="font-display">EduSphere</SheetTitle>
        </SheetHeader>
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
          {showAuthActions ? (
            <>
              <Button asChild variant="outline" onClick={() => setOpen(false)}>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild onClick={() => setOpen(false)}>
                <Link href="/register">Create account</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild onClick={() => setOpen(false)}>
                <Link href={accountHref}>{accountLabel}</Link>
              </Button>
              {isAuthenticated ? <LogoutButton className="w-full" /> : null}
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
