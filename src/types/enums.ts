export const ROLES = ["STUDENT", "INSTRUCTOR", "ADMIN", "SUPER_ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUSES = ["ACTIVE", "BLOCKED", "DELETED"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const APPLICATION_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const ENROLLMENT_STATUSES = [
  "PENDING",
  "ENROLLED",
  "CANCELLED",
] as const;
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

export const REGISTRATION_STATUSES = [
  "PENDING",
  "ENROLLED",
  "CANCELLED",
  "COMPLETED",
] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export const PAYMENT_STATUSES = [
  "PENDING",
  "SUCCEEDED",
  "FAILED",
  "REFUNDED",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_PURPOSES = [
  "TUITION",
  "EXAM_FEE",
  "REGISTRATION_FEE",
  "OTHER",
] as const;
export type PaymentPurpose = (typeof PAYMENT_PURPOSES)[number];

export const ATTENDANCE_STATUSES = [
  "PRESENT",
  "ABSENT",
  "LATE",
  "EXCUSED",
] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export const STUDENT_STATUSES = [
  "PENDING",
  "ACTIVE",
  "INACTIVE",
  "GRADUATED",
  "DROPPED_OUT",
] as const;
export type StudentStatus = (typeof STUDENT_STATUSES)[number];

export const EXAM_TYPES = ["MIDTERM", "FINAL", "QUIZ", "ASSIGNMENT"] as const;
export type ExamType = (typeof EXAM_TYPES)[number];

export const AUTH_PROVIDERS = ["CREDENTIAL", "GOOGLE"] as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];
