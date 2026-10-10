import { Construction } from "lucide-react";
import { EmptyState } from "./empty-state";
import { PageHeader } from "./page-header";

export function ComingSoon({
  title,
  description,
  phase,
}: {
  title: string;
  description?: string;
  phase: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={Construction}
        title="Coming soon"
        description={`This screen is delivered in ${phase}. The layout, navigation and data plumbing are already in place.`}
      />
    </div>
  );
}
