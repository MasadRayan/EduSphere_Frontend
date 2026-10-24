import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { homePathForRole } from "@/lib/auth/role-paths";
import { getSession } from "@/lib/auth/session";
import { AccountMenu } from "./account-menu";
import { MobileNav } from "./mobile-nav";
import { SiteNav } from "./site-nav";
import { ThemeToggle } from "./theme-toggle";

const SITE_LINKS = [
  { label: "Home", href: "/" },
  { label: "Programs", href: "/programs" },
  { label: "Courses", href: "/courses" },
  { label: "Contact", href: "/contact" },
];

export async function SiteHeader() {
  const session = await getSession();
  const accountHref = session ? homePathForRole(session.role) : "/login";
  const accountLabel = session ? "Go to dashboard" : "Log in";

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 md:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          className="col-start-1 flex items-center gap-2 justify-self-start rounded-md outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-4" aria-hidden="true" />
          </span>
          <span className="font-display text-base font-semibold">
            EduSphere
          </span>
        </Link>

        <SiteNav
          links={SITE_LINKS}
          className="col-start-2 hidden items-center gap-1 justify-self-center md:flex"
        />

        <div className="col-start-3 flex items-center gap-2 justify-self-end">
          <ThemeToggle />
          {session ? (
            <AccountMenu
              name={session.name}
              email={session.email}
              avatarUrl={session.avatarUrl}
              dashboardHref={accountHref}
            />
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
            user={
              session
                ? {
                    name: session.name,
                    email: session.email,
                    avatarUrl: session.avatarUrl,
                    role: session.role,
                  }
                : null
            }
          />
        </div>
      </div>
    </header>
  );
}
