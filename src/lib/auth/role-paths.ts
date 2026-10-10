import { ROLES, type Role } from "@/types/enums";

export const ROLE_HOME: Record<Role, string> = {
  STUDENT: "/student",
  INSTRUCTOR: "/instructor",
  ADMIN: "/admin",
  SUPER_ADMIN: "/admin",
};

export function homePathForRole(role: Role): string {
  return ROLE_HOME[role];
}

export function isRole(value: unknown): value is Role {
  return (
    typeof value === "string" && (ROLES as readonly string[]).includes(value)
  );
}
