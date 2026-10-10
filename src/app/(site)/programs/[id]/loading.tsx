import { CatalogDetailSkeleton } from "@/components/catalog/catalog-skeleton";

export default function ProgramDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16">
      <CatalogDetailSkeleton />
    </div>
  );
}
