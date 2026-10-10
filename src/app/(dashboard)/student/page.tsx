import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Student dashboard" };

export default function StudentDashboardPage() {
  return (
    <ComingSoon
      title="Student dashboard"
      description="CGPA, credits, attendance and spend at a glance."
      phase="Phase 4 (Student dashboard)"
    />
  );
}
