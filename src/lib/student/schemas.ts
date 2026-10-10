import { z } from "zod";
import { MAX_ENROLLMENT_COURSES } from "@/lib/constants";

const CURRENT_YEAR = new Date().getFullYear();

export const applySchema = z.object({
  phone: z.string().trim().max(30, "Phone number is too long").optional(),
  departmentName: z.string().trim().min(1, "Select a department"),
  programName: z.string().trim().min(1, "Select a program"),
  enrollmentYear: z.coerce
    .number()
    .int("Enter a valid year")
    .min(2000, "Enrollment year is invalid")
    .max(CURRENT_YEAR + 1, "Enrollment year is invalid"),
});

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(60, "Name must be at most 60 characters"),
  phone: z.string().trim().max(30, "Phone number is too long").optional(),
});

export const enrollSchema = z.object({
  courseIds: z
    .array(z.string().min(1))
    .min(1, "Select at least one course")
    .max(
      MAX_ENROLLMENT_COURSES,
      `You can select up to ${MAX_ENROLLMENT_COURSES} courses`,
    )
    .refine(
      (ids) => new Set(ids).size === ids.length,
      "Duplicate courses are not allowed",
    ),
});

export type ApplyInput = z.infer<typeof applySchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type EnrollInput = z.infer<typeof enrollSchema>;
