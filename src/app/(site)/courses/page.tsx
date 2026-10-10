import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogListSkeleton } from "@/components/catalog/catalog-skeleton";
import { CoursesSection } from "@/components/catalog/courses-section";
import type { CatalogSearchParams } from "@/components/catalog/programs-section";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Browse every course in the catalog: course codes, credit hours, departments and prerequisites.",
  alternates: { canonical: "/courses" },
  openGraph: {
    type: "website",
    url: absoluteUrl("/courses"),
    title: "Courses | EduSphere",
    description:
      "Browse every course in the catalog: codes, credits, departments and prerequisites.",
  },
};

export default function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  return (
    <div className="flex flex-col">
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 md:py-20">
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            Courses
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight text-balance">
            The whole catalog, down to the credit hour.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Search by course code or title, filter by department, and check what
            each course requires before you enroll.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto w-full max-w-7xl px-4 py-12">
          <Suspense fallback={<CatalogListSkeleton />}>
            <CoursesSection searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
