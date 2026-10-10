import type { AuthProvider, Role, UserStatus } from "./enums";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  emailVerified: boolean;
  authProvider: AuthProvider;
  avatarUrl: string | null;
  avatarPublicId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfileSummary {
  id: string;
  departmentId: string;
  programId: string;
}

export interface InstructorProfileSummary {
  id: string;
  departmentId: string;
}

export interface SessionUser extends User {
  studentProfile: StudentProfileSummary | null;
  instructorProfile: InstructorProfileSummary | null;
}

export interface Session {
  user: SessionUser;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Program {
  id: string;
  name: string;
  degreeType: string;
  totalCredits: number;
  departmentId: string;
  department?: Department;
}

export interface CoursePrerequisite {
  id: string;
  courseId: string;
  prerequisiteId: string;
  prerequisite?: {
    id?: string;
    code: string;
    title: string;
  };
}

export interface Course {
  id: string;
  code: string;
  title: string;
  creditHours: number;
  departmentId: string;
  department?: Department;
  prerequisites?: CoursePrerequisite[];
}
