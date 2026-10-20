import type {
  ApplicationStatus,
  AttendanceStatus,
  AuthProvider,
  EnrollmentStatus,
  ExamType,
  PaymentPurpose,
  PaymentStatus,
  RegistrationStatus,
  Role,
  StudentStatus,
  UserStatus,
} from "./enums";
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  emailVerified: boolean;
  authProvider: AuthProvider;
  /** Raw photo the backend stores on the user (Cloudinary or Google). */
  imageURL: string | null;
  imagePublicId?: string | null;
  /**
   * Resolved photo for the session. The backend sends the profile photo on
   * studentProfile/instructorProfile, so session.ts fills this from there and
   * falls back to imageURL.
   */
  avatarUrl: string | null;
  avatarPublicId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfileSummary {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  departmentId: string;
  programId: string;
}

export interface InstructorProfileSummary {
  id: string;
  fullName: string;
  avatarUrl: string | null;
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

export interface Semester {
  id: string;
  name: string;
  year: number;
  startDate: string;
  endDate: string;
  registrationDeadline: string | null;
  isActive: boolean;
}

export interface CourseSection {
  id: string;
  sectionCode: string;
  courseId: string;
  course?: Course;
  semesterId: string;
  semester?: Semester;
  instructorId: string | null;
  instructor?: { id: string; user: { name: string; email: string } } | null;
  capacity: number;
  schedule: string | null;
}

export interface StudentSection {
  id: string;
  sectionCode: string;
  programId: string;
  enrollmentYear: number;
  capacity: number;
}

export interface StudentProfile {
  id: string;
  userId: string;
  studentId: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  studentStatus: StudentStatus;
  departmentId: string;
  department?: Department;
  programId: string;
  program?: Program;
  currentSemesterId: string | null;
  currentSemester?: Semester | null;
  sectionId: string | null;
  section?: StudentSection | null;
  enrollmentYear: number;
  cgpa: number;
}

export interface StudentApplication {
  id: string;
  userId: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  departmentId: string;
  department?: Department;
  programId: string;
  program?: Program;
  enrollmentYear: number;
  status: ApplicationStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; email: string; imageURL: string | null };
}

export interface StudentMe extends User {
  studentProfile: StudentProfile | null;
  studentApplication: StudentApplication | null;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  purpose: PaymentPurpose;
  status: PaymentStatus;
  bkashPaymentId: string | null;
  bkashTrxId: string | null;
  merchantInvoiceNumber: string | null;
  bkashStatus: string | null;
  refundTrxId: string | null;
  refundedAt: string | null;
  semesterEnrollmentId: string | null;
  user?: { name: string; email: string };
  semesterEnrollment?: {
    id: string;
    semesterId: string;
    totalCredits: number;
    totalFee: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CourseRegistration {
  id: string;
  studentId: string;
  courseSectionId: string;
  courseSection: CourseSection;
  semesterEnrollmentId: string | null;
  status: RegistrationStatus;
  registeredAt: string;
}

export interface CourseSectionExamWithResult {
  id: string;
  type: ExamType;
  date: string;
  totalMarks: number;
  results?: {
    id: string;
    marksObtained: number | null;
    grade: string | null;
    gradePoint: number | null;
  }[];
}

export interface RegisteredCourseAttendance {
  id: string;
  date: string;
  status: AttendanceStatus;
}

export interface RegisteredCourseDetail extends CourseRegistration {
  courseSection: CourseSection & {
    exams?: CourseSectionExamWithResult[];
    attendances?: RegisteredCourseAttendance[];
  };
}

export interface SemesterEnrollment {
  id: string;
  studentId: string;
  semesterId: string;
  semester?: Semester;
  totalCredits: number;
  totalFee: number;
  status: EnrollmentStatus;
  createdAt: string;
  updatedAt: string;
  registrations?: CourseRegistration[];
  payment?: Payment | null;
  student?: {
    id: string;
    studentId: string;
    fullName: string;
    user: { name: string; email: string };
  };
}

export interface AttendanceRecord {
  date: string;
  status: AttendanceStatus;
}

export interface AttendanceGroup {
  courseSectionId: string;
  sectionCode: string;
  course: { code: string; title: string; creditHours: number };
  semester: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
  records: AttendanceRecord[];
}

export interface CourseGradeExam {
  type: ExamType;
  date: string;
  totalMarks: number;
  marksObtained: number;
  grade: string | null;
  gradePoint: number | null;
}

export interface CourseGrade {
  course: { code: string; title: string; creditHours: number };
  semester: string;
  sectionCode: string;
  exams: CourseGradeExam[];
  totalMarks: number;
  marksObtained: number;
  averageGradePoint: number | null;
}

export interface GradeDetail {
  registrationId: string;
  status: RegistrationStatus;
  course: Course;
  semester: Semester;
  sectionCode: string;
  attendance: {
    totalClasses: number;
    attendedClasses: number;
    percentage: number;
  };
  exams: {
    examId: string;
    type: ExamType;
    date: string;
    totalMarks: number;
    marksObtained: number | null;
    grade: string | null;
    gradePoint: number | null;
  }[];
  averageGradePoint: number | null;
}

export interface CgpaResult {
  cgpa: number;
  totalCredits: number;
  courseCount: number;
}

export interface TranscriptCourseRow {
  code: string;
  title: string;
  creditHours: number;
  gradePoint: number | null;
  grade: string | null;
}

export interface TranscriptSemester {
  id: string;
  name: string;
  year: number;
  gpa: number;
  creditsAttempted: number;
  creditsEarned: number;
  courses: TranscriptCourseRow[];
}

export interface Transcript {
  student: {
    fullName: string;
    studentId: string;
    departmentName: string;
    programName: string;
    sectionCode: string | null;
    enrollmentYear: number;
  };
  semesters: TranscriptSemester[];
  summary: {
    creditsAttempted: number;
    creditsEarned: number;
    cgpa: number;
  };
}

export interface InstructorProfile {
  id: string;
  userId: string;
  /** Staff code like INS-2026-0001, generated on approval. */
  instructorId?: string;
  instructorCode?: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  designation: string | null;
  departmentId: string;
  department?: Department;
  user?: { name: string; email: string };
  courseSections?: CourseSection[];
}

export interface InstructorApplication {
  id: string;
  userId: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  resumeUrl: string | null;
  designation: string | null;
  coverNote: string | null;
  departmentId: string;
  department?: Department;
  status: ApplicationStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; email: string; imageURL: string | null };
}

export interface InstructorMe extends User {
  instructorProfile: InstructorProfile | null;
  instructorApplication: InstructorApplication | null;
}

export interface SectionStudent {
  /** StudentProfile id used for attendance and result payloads. */
  id: string;
  /** Student ID code like STU-2023-0001. */
  studentId: string;
  user: { name: string; email: string; imageURL: string | null };
}

export interface InstructorExam {
  id: string;
  sectionId?: string;
  type: ExamType;
  date: string;
  totalMarks: number;
  courseSection?: CourseSection;
}

export interface InstructorResultRow {
  id: string;
  examId: string;
  studentId: string;
  marksObtained: number | null;
  grade: string | null;
  gradePoint: number | null;
  student?: SectionStudent;
  exam?: InstructorExam;
}

export interface InstructorAttendanceRecord {
  id: string;
  studentId: string;
  courseSectionId: string;
  date: string;
  status: AttendanceStatus;
  student?: SectionStudent;
}

export interface InstructorAnalytics {
  sections: {
    totalSections: number;
    totalCoursesTaught: number;
    totalCapacity: number;
    seatsFilled: number;
    fillRate: number;
  };
  students: { totalStudentsEnrolled: number };
  exams: { totalExams: number; upcomingExams: number; pendingGrading: number };
  attendance: {
    totalRecords: number;
    presentRecords: number;
    attendanceRate: number;
  };
  grading: { totalGradeEntries: number };
}

export interface AdminAnalytics {
  users: { totalStudents: number; totalInstructors: number };
  applications: {
    student: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    };
    instructor: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    };
  };
  academics: {
    departments: number;
    programs: number;
    courses: number;
    semesters: number;
    activeSemesters: number;
  };
  enrollments: {
    courseSections: number;
    semesterEnrollments: number;
    enrolledEnrollments: number;
    courseRegistrations: number;
    enrolledRegistrations: number;
    completedRegistrations: number;
  };
  assessment: {
    exams: number;
    results: number;
    attendanceRecords: number;
    presentRecords: number;
    attendanceRate: number;
  };
  finance: { totalRevenue: number; totalRefunded: number; netRevenue: number };
}

export interface AdminStudentProfileSummary {
  id: string;
  studentId: string;
  cgpa: number;
  currentSemester?: { id: string; name: string; year: number } | null;
}

export interface AdminInstructorProfileSummary {
  id: string;
  instructorId?: string;
  designation?: string | null;
  departmentId?: string;
  department?: Department;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  emailVerified: boolean;
  authProvider: AuthProvider;
  needPasswordChange?: boolean;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  studentProfile?: AdminStudentProfileSummary | null;
  instructorProfile?: AdminInstructorProfileSummary | null;
  studentApplication?: { id: string; status: ApplicationStatus } | null;
  instructorApplication?: { id: string; status: ApplicationStatus } | null;
}

export interface InstructorAdminRow {
  id: string;
  userId: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  designation: string | null;
  departmentId: string;
  department?: Department;
  user?: { name: string; email: string };
  _count?: { courseSections: number };
}

export interface AdminSemester extends Semester {
  _count?: { sections: number; students: number };
}

export interface StudentSectionAdmin extends StudentSection {
  program?: { id: string; name: string } | null;
  enrolledCount?: number;
  seatsAvailable?: number;
}

export interface StudentAnalytics {
  academic: {
    cgpa: number;
    totalCreditsCompleted: number;
    completedCourses: number;
    coursesInProgress: number;
    inProgressCredits: number;
    totalExamsTaken: number;
    totalExamsAvailable: number;
    completionRate: number;
  };
  attendance: {
    totalClasses: number;
    attendedClasses: number;
    attendancePercentage: number;
  };
  grades: {
    gradeBreakdown: Record<string, number>;
  };
  finance: {
    totalAmountSpent: number;
    totalRefunded: number;
  };
}
