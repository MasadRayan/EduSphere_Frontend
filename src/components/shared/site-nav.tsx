"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function isActiveLink(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav({
  links,
  className,
}: {
  links: { label: string; href: string }[];
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className={className}>
      {links.map((link) => {
        const active = isActiveLink(pathname, link.href);
        return (
          <Button key={link.href} asChild variant="ghost" size="sm">
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(active && "text-foreground")}
            >
              {link.label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
