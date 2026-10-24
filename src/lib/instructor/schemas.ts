import { z } from "zod";
import {
  createExamSchema,
  examSchema,
  gradingSchema,
  resultRowSchema,
  singleResultSchema,
} from "@/lib/schemas/academic";
import { ATTENDANCE_STATUSES } from "@/types/enums";

export {
  createExamSchema,
  examSchema,
  gradingSchema,
  resultRowSchema,
  singleResultSchema,
};

export const applySchema = z.object({
  phone: z.string().trim().max(30, "Phone number is too long").optional(),
  departmentName: z.string().trim().min(1, "Select a department"),
  designation: z.string().trim().max(80, "Designation is too long").optional(),
  coverNote: z
    .string()
    .trim()
    .max(500, "Keep the cover note under 500 characters")
    .optional(),
});

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(60, "Name must be at most 60 characters"),
  phone: z.string().trim().max(30, "Phone number is too long").optional(),
});

export const attendanceSheetSchema = z.object({
  courseSectionId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
});

export const attendanceRecordSchema = z.object({
  studentId: z.string().min(1),
  status: z.enum(ATTENDANCE_STATUSES),
});

export type ApplyInput = z.infer<typeof applySchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ExamInput = z.infer<typeof examSchema>;
export type AttendanceRecordInput = z.infer<typeof attendanceRecordSchema>;
export type ResultRowInput = z.infer<typeof resultRowSchema>;
