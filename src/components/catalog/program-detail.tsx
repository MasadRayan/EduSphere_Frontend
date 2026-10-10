import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/errors";
import { getSession } from "@/lib/auth/session";
import { isCatalogGated } from "@/lib/catalog/gate";
import { getProgram } from "@/lib/catalog/service";
import { CatalogGate } from "./catalog-gate";

export async function ProgramDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    return <CatalogGate nextPath={`/programs/${id}`} what="Program details" />;
  }

  let program: Awaited<ReturnType<typeof getProgram>>;
  try {
    program = await getProgram(id);
  } catch (error) {
    if (isCatalogGated(error)) {
      return (
        <CatalogGate nextPath={`/programs/${id}`} what="Program details" />
      );
    }
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
          Program
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {program.name}
        </h1>
        <p className="text-muted-foreground">
          {program.degreeType}
          {program.department ? ` · ${program.department.name}` : null}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1 rounded-xl border border-border bg-background p-4">
          <p className="text-sm text-muted-foreground">Degree type</p>
          <p className="font-display text-lg font-semibold">
            {program.degreeType}
          </p>
        </div>
        <div className="space-y-1 rounded-xl border border-border bg-background p-4">
          <p className="text-sm text-muted-foreground">Total credits</p>
          <p className="font-mono text-lg font-semibold">
            {program.totalCredits}
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Courses in this department
        </h2>
        <p className="text-sm text-muted-foreground">
          Every course that counts toward this program is listed in the course
          catalog.
        </p>
        <Button asChild variant="outline">
          <Link href={`/courses?departmentId=${program.departmentId}`}>
            <BookOpen className="size-4" aria-hidden="true" />
            Browse courses
          </Link>
        </Button>
      </section>

      <div>
        <Button asChild variant="ghost">
          <Link href="/programs">
            <ArrowLeft className="size-4" aria-hidden="true" />
            All programs
          </Link>
        </Button>
      </div>
    </article>
  );
}
