import { z } from "zod";
import { ROLES, STUDENT_STATUSES, USER_STATUSES } from "@/types/enums";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const departmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  code: z
    .string()
    .trim()
    .min(2, "Code must be at least 2 characters")
    .max(20, "Code must be at most 20 characters"),
});

export const programSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  degreeType: z
    .string()
    .trim()
    .min(2, "Degree type must be at least 2 characters")
    .max(50, "Degree type must be at most 50 characters"),
  totalCredits: z.coerce
    .number()
    .int("Enter whole credits")
    .positive("Credits must be positive")
    .max(500, "Credits look too high"),
  departmentId: z.string().min(1, "Select a department"),
});

export const courseSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Code must be at least 2 characters")
    .max(20, "Code must be at most 20 characters"),
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be at most 200 characters"),
  creditHours: z.coerce
    .number()
    .int("Enter whole credit hours")
    .min(1, "Credits must be at least 1")
    .max(12, "Credits look too high"),
  departmentId: z.string().min(1, "Select a department"),
  prerequisiteIds: z
    .array(z.string().min(1))
    .max(50, "Too many prerequisites")
    .optional(),
});

export const semesterSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters"),
    year: z.coerce
      .number()
      .int("Enter a valid year")
      .min(2000, "Year is invalid")
      .max(2100, "Year is invalid"),
    startDate: z.string().regex(DATE_REGEX, "Pick a start date"),
    endDate: z.string().regex(DATE_REGEX, "Pick an end date"),
    registrationDeadline: z
      .union([z.string().regex(DATE_REGEX), z.literal("")])
      .optional(),
    isActive: z.boolean(),
  })
  .refine(
    (data) =>
      new Date(data.endDate).getTime() > new Date(data.startDate).getTime(),
    {
      message: "End date must be after the start date",
      path: ["endDate"],
    },
  );

export const courseSectionCreateSchema = z.object({
  courseId: z.string().min(1, "Select a course"),
  semesterId: z.string().min(1, "Select a semester"),
  sectionCode: z
    .string()
    .trim()
    .min(1, "Enter a section code")
    .max(10, "Section code is too long"),
  instructorId: z.union([z.string().min(1), z.literal("")]).optional(),
  capacity: z.coerce
    .number()
    .int("Enter whole seats")
    .positive("Capacity must be positive")
    .max(1000, "Capacity looks too high"),
  schedule: z.string().trim().max(120, "Schedule is too long").optional(),
});

export const courseSectionUpdateSchema = z.object({
  sectionCode: z
    .string()
    .trim()
    .min(1, "Enter a section code")
    .max(10, "Section code is too long"),
  instructorId: z.union([z.string().min(1), z.literal("")]).optional(),
  capacity: z.coerce
    .number()
    .int("Enter whole seats")
    .positive("Capacity must be positive")
    .max(1000, "Capacity looks too high"),
  schedule: z.string().trim().max(120, "Schedule is too long").optional(),
});

export const studentSectionCreateSchema = z.object({
  sectionCode: z
    .string()
    .trim()
    .min(1, "Enter a section code")
    .max(10, "Section code is too long"),
  programId: z.string().min(1, "Select a program"),
  enrollmentYear: z.coerce
    .number()
    .int("Enter a valid year")
    .min(2000, "Year is invalid")
    .max(new Date().getFullYear() + 1, "Year is invalid"),
  capacity: z.coerce
    .number()
    .int("Enter whole seats")
    .positive("Capacity must be positive")
    .max(1000, "Capacity looks too high"),
});

export const studentSectionUpdateSchema = z.object({
  sectionCode: z
    .string()
    .trim()
    .min(1, "Enter a section code")
    .max(10, "Section code is too long"),
  capacity: z.coerce
    .number()
    .int("Enter whole seats")
    .positive("Capacity must be positive")
    .max(1000, "Capacity looks too high"),
});

export const studentApproveSchema = z.object({
  studentId: z
    .string()
    .trim()
    .min(1, "Enter the student's roll number")
    .max(30, "Student ID is too long"),
  reviewNote: z
    .string()
    .trim()
    .max(500, "Keep the note under 500 characters")
    .optional(),
  currentSemesterId: z.union([z.string().min(1), z.literal("")]).optional(),
  sectionId: z.union([z.string().min(1), z.literal("")]).optional(),
});

export const rejectSchema = z.object({
  reviewNote: z
    .string()
    .trim()
    .max(500, "Keep the note under 500 characters")
    .optional(),
});

export const instructorApproveSchema = z.object({
  reviewNote: z
    .string()
    .trim()
    .max(500, "Keep the note under 500 characters")
    .optional(),
  designation: z.string().trim().max(80, "Designation is too long").optional(),
  departmentId: z.union([z.string().min(1), z.literal("")]).optional(),
});

export const instructorUpdateSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(60, "Name must be at most 60 characters"),
  phone: z.string().trim().max(30, "Phone number is too long").optional(),
  designation: z.string().trim().max(80, "Designation is too long").optional(),
  departmentId: z.union([z.string().min(1), z.literal("")]).optional(),
});

export const studentSemesterSchema = z.object({
  profileId: z.string().min(1),
  currentSemesterId: z.union([z.string().min(1), z.literal("")]).optional(),
});

export const studentSectionAssignSchema = z.object({
  profileId: z.string().min(1),
  sectionId: z.union([z.string().min(1), z.literal("")]).optional(),
});

export const studentStatusSchema = z.object({
  profileId: z.string().min(1),
  status: z.enum(STUDENT_STATUSES),
});

export const userStatusSchema = z.object({
  userId: z.string().min(1),
  status: z.enum(USER_STATUSES),
});

export const userRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(ROLES),
});

/** Only these statuses may be overridden per course registration. */
const OVERRIDE_REGISTRATION_STATUSES = [
  "ENROLLED",
  "COMPLETED",
  "CANCELLED",
] as const;

export const registrationOverrideSchema = z.object({
  registrationId: z.string().min(1),
  status: z.enum(OVERRIDE_REGISTRATION_STATUSES),
});

export type DepartmentInput = z.infer<typeof departmentSchema>;
export type ProgramInput = z.infer<typeof programSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type SemesterInput = z.infer<typeof semesterSchema>;
export type CourseSectionCreateInput = z.infer<
  typeof courseSectionCreateSchema
>;
export type CourseSectionUpdateInput = z.infer<
  typeof courseSectionUpdateSchema
>;
export type StudentSectionCreateInput = z.infer<
  typeof studentSectionCreateSchema
>;
export type StudentSectionUpdateInput = z.infer<
  typeof studentSectionUpdateSchema
>;
export type StudentApproveInput = z.infer<typeof studentApproveSchema>;
export type InstructorApproveInput = z.infer<typeof instructorApproveSchema>;
export type InstructorUpdateInput = z.infer<typeof instructorUpdateSchema>;
