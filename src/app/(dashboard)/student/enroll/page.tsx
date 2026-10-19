import type { Metadata } from "next";
import { Suspense } from "react";
import {
  CourseRegistrationSection,
  CourseRegistrationSkeleton,
} from "@/components/student/course-registration";
import { requireStudentProfile } from "@/lib/auth/roles";
import { allParams, type SearchParamsInput } from "@/lib/search-params";

export const metadata: Metadata = { title: "Enroll in courses" };

export default async function StudentEnrollPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  await requireStudentProfile();

  const params = await searchParams;
  // The catalog links here with one courseId per ticked course, so read every
  // value rather than only the first one.
  const initialCourseIds = allParams(params.courseId);

  return (
    <Suspense fallback={<CourseRegistrationSkeleton />}>
      <CourseRegistrationSection initialCourseIds={initialCourseIds} />
    </Suspense>
  );
}
