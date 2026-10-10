import { GraduationCap } from "lucide-react";
import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Home", href: "/" },
  { label: "Programs", href: "/programs" },
  { label: "Courses", href: "/courses" },
  { label: "Contact", href: "/contact" },
  { label: "Log in", href: "/login" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-4" aria-hidden="true" />
            </span>
            <span className="font-display text-base font-semibold">
              EduSphere
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            The academic workspace for applications, enrollment, payments,
            attendance and results.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-3 text-sm">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="w-fit text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 font-mono text-xs tracking-wide text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>EduSphere · Registrar's office, online</span>
          <span>Fall 2026 intake is open</span>
        </div>
      </div>
    </footer>
  );
}
