import { z } from "zod";
import { EXAM_TYPES } from "@/types/enums";

/**
 * Exam and result schemas shared by the instructor and admin surfaces. They
 * live here rather than inside a single feature so admin actions do not have
 * to reach into the instructor feature for them.
 */
export const examSchema = z.object({
  courseSectionId: z.string().min(1, "Select a course section"),
  type: z.enum(EXAM_TYPES),
  date: z.coerce.date(),
  totalMarks: z.coerce
    .number()
    .int("Enter whole marks")
    .positive("Total marks must be positive")
    .max(1000, "Total marks look too high"),
});

export const gradingSchema = z.object({
  examId: z.string().min(1),
});

export const resultRowSchema = z.object({
  studentId: z.string().min(1),
  marksObtained: z.coerce.number().min(0, "Marks cannot be negative"),
});

export const singleResultSchema = z.object({
  resultId: z.string().min(1),
  marksObtained: z.coerce.number().min(0, "Marks cannot be negative"),
});
