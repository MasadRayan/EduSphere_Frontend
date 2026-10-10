import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { homePathForRole } from "@/lib/auth/role-paths";
import { getSession } from "@/lib/auth/session";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";

const SITE_LINKS = [
  { label: "Home", href: "/" },
  { label: "Programs", href: "/programs" },
];

export async function SiteHeader() {
  const session = await getSession();
  const accountHref = session ? homePathForRole(session.role) : "/login";
  const accountLabel = session ? "Go to dashboard" : "Log in";

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-4 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-4" aria-hidden="true" />
          </span>
          <span className="font-display text-base font-semibold">
            EduSphere
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {SITE_LINKS.map((link) => (
            <Button key={link.href} asChild variant="ghost" size="sm">
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {session ? (
            <Button asChild size="sm" className="hidden md:inline-flex">
              <Link href={accountHref}>Go to dashboard</Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden md:inline-flex"
              >
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm" className="hidden md:inline-flex">
                <Link href="/register">Create account</Link>
              </Button>
            </>
          )}
          <MobileNav
            links={SITE_LINKS}
            accountHref={accountHref}
            accountLabel={accountLabel}
            showAuthActions={!session}
          />
        </div>
      </div>
    </header>
  );
}
