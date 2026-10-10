import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TONE_STYLES = {
  default: "text-foreground",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-destructive",
} as const;

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: LucideIcon;
  tone?: keyof typeof TONE_STYLES;
  className?: string;
}) {
  return (
    <Card className={cn("gap-2", className)}>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          {Icon ? (
            <Icon
              className={cn("size-4", TONE_STYLES[tone])}
              aria-hidden="true"
            />
          ) : null}
        </div>
        <p className="font-mono text-2xl font-semibold tracking-tight">
          {value}
        </p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
