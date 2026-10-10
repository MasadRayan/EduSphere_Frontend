export const APP_NAME = "EduSphere";

export const PAGE_SIZE_DEFAULT = 10;
export const PAGE_SIZE_MAX = 100;
export const CONTENT_MAX_WIDTH = "80rem";

/**
 * Soft cap shown while picking courses. The backend owns the real limit
 * (MAX_CREDITS_PER_SEMESTER) and its message stays authoritative on submit.
 */
export const MAX_SEMESTER_CREDITS = 25;
export const MAX_ENROLLMENT_COURSES = 20;

/**
 * Fee used for the enrollment estimate only. The backend owns the real rate
 * (CREDIT_FEE_RATE) and the invoice total stays authoritative.
 */
export const CREDIT_FEE_RATE = 2000;
