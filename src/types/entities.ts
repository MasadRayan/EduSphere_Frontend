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
