import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Program } from "@/types/entities";

export function ProgramCard({ program }: { program: Program }) {
  return (
    <Link
      href={`/programs/${program.id}`}
      className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="h-full transition-colors group-hover:ring-primary/40">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            {program.department ? (
              <span className="inline-flex w-fit items-center rounded-md border border-border bg-card px-2 py-0.5 font-mono text-xs font-medium tracking-tight">
                {program.department.code}
              </span>
            ) : null}
            <Badge variant="outline">{program.degreeType}</Badge>
          </div>
          <CardTitle className="font-display text-lg">{program.name}</CardTitle>
        </CardHeader>
        <CardContent className="mt-auto flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {program.department?.name}
          </span>
          <span className="font-mono text-sm font-semibold">
            {program.totalCredits} cr
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
