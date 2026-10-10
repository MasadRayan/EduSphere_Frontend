import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = {
  title: "Programs",
  description: "Browse the university's departments and programs.",
};

export default function ProgramsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10">
      <ComingSoon
        title="Programs"
        description="Explore departments and the degrees they offer."
        phase="Phase 3 (Public pages)"
      />
    </div>
  );
}
