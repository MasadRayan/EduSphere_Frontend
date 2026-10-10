import { GraduationCap } from "lucide-react";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-4" aria-hidden="true" />
          </span>
          <div className="flex flex-col">
            <span className="font-display text-sm font-semibold">
              EduSphere
            </span>
            <span className="text-xs text-muted-foreground">
              University management, in one place.
            </span>
          </div>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-4 text-sm">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground"
          >
            Home
          </Link>
          <Link
            href="/programs"
            className="text-muted-foreground hover:text-foreground"
          >
            Programs
          </Link>
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground"
          >
            Log in
          </Link>
        </nav>
      </div>
    </footer>
  );
}
