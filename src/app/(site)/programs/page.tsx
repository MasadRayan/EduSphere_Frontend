import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogListSkeleton } from "@/components/catalog/catalog-skeleton";
import type { CatalogSearchParams } from "@/components/catalog/programs-section";
import { ProgramsSection } from "@/components/catalog/programs-section";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "Browse the university's departments and the degrees they offer, from bachelor's programs to graduate study.",
  alternates: { canonical: "/programs" },
  openGraph: {
    type: "website",
    url: absoluteUrl("/programs"),
    title: "Programs | EduSphere",
    description:
      "Browse the university's departments and the degrees they offer.",
  },
};

export default function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  return (
    <div className="flex flex-col">
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 md:py-20">
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            Programs
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight text-balance">
            Find the degree that fits your file.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Every program sits inside a department. Filter by department or
            search by name to see degree types and total credits.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto w-full max-w-7xl px-4 py-12">
          <Suspense fallback={<CatalogListSkeleton />}>
            <ProgramsSection searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
