/**
 * Cache tags for the shared catalog data. The catalog reads tag their cache
 * entries with these values and the admin actions expire them after an edit,
 * so every screen that renders the data refreshes without a hand-maintained
 * path list.
 */
export const TAGS = {
  departments: "departments",
  programs: "programs",
  program: (id: string) => `program-${id}`,
  courses: "courses",
  course: (id: string) => `course-${id}`,
  semesters: "semesters",
} as const;
