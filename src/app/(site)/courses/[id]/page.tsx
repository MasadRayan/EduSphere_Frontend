import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogDetailSkeleton } from "@/components/catalog/catalog-skeleton";
import { CourseDetail } from "@/components/catalog/course-detail";
import { getCourse } from "@/lib/catalog/service";
import { absoluteUrl } from "@/lib/site";

type CourseParams = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: CourseParams;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const course = await getCourse(id);
    const department = course.department?.name ?? "EduSphere";
    return {
      title: `${course.code} ${course.title}`,
      description: `${course.title} (${course.code}), ${course.creditHours} credit hours, offered by ${department}.`,
      alternates: { canonical: `/courses/${id}` },
      openGraph: {
        type: "website",
        url: absoluteUrl(`/courses/${id}`),
        title: `${course.code} ${course.title} | EduSphere`,
        description: `${course.title} - ${course.creditHours} credit hours in ${department}.`,
      },
    };
  } catch {
    return { title: "Course", alternates: { canonical: `/courses/${id}` } };
  }
}

export default function CoursePage({ params }: { params: CourseParams }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16">
      <Suspense fallback={<CatalogDetailSkeleton />}>
        <CourseDetail params={params} />
      </Suspense>
    </div>
  );
}
