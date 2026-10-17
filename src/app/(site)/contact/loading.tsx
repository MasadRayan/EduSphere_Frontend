import { Skeleton } from "@/components/ui/skeleton";

export default function ContactLoading() {
  return (
    <div className="flex flex-col" aria-hidden="true">
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-7xl space-y-4 px-4 py-16 md:py-20">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full max-w-2xl" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-8">
            <div className="space-y-3">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-full max-w-sm" />
            </div>
            <ul className="space-y-3">
              {["channel-a", "channel-b", "channel-c"].map((key) => (
                <li
                  key={key}
                  className="flex gap-4 rounded-xl border border-border bg-background p-4"
                >
                  <Skeleton className="size-10 shrink-0 rounded-lg" />
                  <div className="w-full space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3.5 w-full max-w-xs" />
                    <Skeleton className="h-4 w-44" />
                  </div>
                </li>
              ))}
            </ul>
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>

          <div className="rounded-2xl border border-border bg-background p-6 sm:p-8">
            <div className="mb-6 space-y-2">
              <Skeleton className="h-7 w-52" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="space-y-5">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
