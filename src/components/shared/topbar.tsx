"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PROFILE_HREF_BY_ROLE, ROLE_LABEL, type NavUser } from "@/lib/nav";
import { AvatarWithFallback } from "./avatar-with-fallback";
import { ThemeToggle } from "./theme-toggle";

export function Topbar({ user }: { user: NavUser }) {
  const profileHref = PROFILE_HREF_BY_ROLE[user.role];

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />
      <p className="min-w-0 flex-1 truncate font-display text-sm font-medium">
        {ROLE_LABEL[user.role]} workspace
      </p>
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Account menu"
          >
            <AvatarWithFallback
              name={user.name}
              src={user.avatarUrl}
              size="sm"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{user.name}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {user.email}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {profileHref ? (
            <DropdownMenuItem asChild>
              <Link href={profileHref}>My profile</Link>
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem asChild>
            <Link href="/">Back to site</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
