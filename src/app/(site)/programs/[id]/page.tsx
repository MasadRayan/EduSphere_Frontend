import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogDetailSkeleton } from "@/components/catalog/catalog-skeleton";
import { ProgramDetail } from "@/components/catalog/program-detail";
import { getProgram } from "@/lib/catalog/service";
import { absoluteUrl } from "@/lib/site";

type ProgramParams = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: ProgramParams;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const program = await getProgram(id);
    const department = program.department?.name ?? "EduSphere";
    return {
      title: program.name,
      description: `${program.degreeType} program in ${department} with ${program.totalCredits} total credits.`,
      alternates: { canonical: `/programs/${id}` },
      openGraph: {
        type: "website",
        url: absoluteUrl(`/programs/${id}`),
        title: `${program.name} | EduSphere`,
        description: `${program.degreeType} program in ${department}.`,
      },
    };
  } catch {
    return { title: "Program", alternates: { canonical: `/programs/${id}` } };
  }
}

export default function ProgramPage({ params }: { params: ProgramParams }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16">
      <Suspense fallback={<CatalogDetailSkeleton />}>
        <ProgramDetail params={params} />
      </Suspense>
    </div>
  );
}
