import { cn } from "@/lib/utils";

const MAX_CREDIT_BAR = 6;

export function CourseCodeTag({
  code,
  credits,
  className,
}: {
  code: string;
  credits?: number | null;
  className?: string;
}) {
  const barWidth =
    typeof credits === "number" && credits > 0
      ? `${Math.min(credits, MAX_CREDIT_BAR) / MAX_CREDIT_BAR * 100}%`
      : null;

  return (
    <span className={cn("inline-flex flex-col gap-1", className)}>
      <span className="inline-flex w-fit items-center rounded-md border border-border bg-card px-2 py-0.5 font-mono text-xs font-medium tracking-tight text-foreground">
        {code}
      </span>
      {barWidth ? (
        <span
          className="block h-0.5 max-w-[7rem] rounded-full bg-primary"
          style={{ width: barWidth }}
          aria-hidden="true"
        />
      ) : null}
    </span>
  );
}
