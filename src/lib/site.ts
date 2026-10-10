export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}

export const SITE_NAME = "EduSphere";

export const SITE_DESCRIPTION =
  "EduSphere is a university management platform for applications, enrollment, payments, attendance, results and analytics.";
