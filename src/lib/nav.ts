import {
  BarChart3,
  BookMarked,
  BookOpen,
  Building2,
  CalendarCheck,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Layers,
  type LucideIcon,
  Receipt,
  School,
  ScrollText,
  UserCog,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react";
import type { Role } from "@/types/enums";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export interface NavUser {
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
}

const STUDENT_NAV: NavSection[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/student", icon: LayoutDashboard },
      { label: "My profile", href: "/student/profile", icon: UserRound },
    ],
  },
  {
    label: "Academics",
    items: [
      { label: "Enroll", href: "/student/enroll", icon: BookOpen },
      {
        label: "My enrollments",
        href: "/student/enrollments",
        icon: ClipboardList,
      },
      {
        label: "Registered courses",
        href: "/student/courses",
        icon: BookMarked,
      },
      { label: "Attendance", href: "/student/attendance", icon: CalendarCheck },
      { label: "Grades", href: "/student/grades", icon: GraduationCap },
      { label: "Transcript", href: "/student/transcript", icon: ScrollText },
    ],
  },
  {
    label: "Finance",
    items: [{ label: "My payments", href: "/student/payments", icon: CreditCard }],
  },
];

const INSTRUCTOR_NAV: NavSection[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/instructor", icon: LayoutDashboard },
      { label: "My profile", href: "/instructor/profile", icon: UserRound },
    ],
  },
  {
    label: "Teaching",
    items: [
      { label: "My sections", href: "/instructor/sections", icon: Layers },
      { label: "Exams", href: "/instructor/exams", icon: ClipboardList },
      {
        label: "Attendance",
        href: "/instructor/attendance",
        icon: CalendarCheck,
      },
      { label: "Results", href: "/instructor/results", icon: GraduationCap },
    ],
  },
];

const ADMIN_NAV: NavSection[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Admissions",
    items: [
      {
        label: "Student applications",
        href: "/admin/student-applications",
        icon: ClipboardCheck,
      },
      {
        label: "Instructor applications",
        href: "/admin/instructor-applications",
        icon: UserPlus,
      },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Instructors", href: "/admin/instructors", icon: UserCog },
    ],
  },
  {
    label: "Academic structure",
    items: [
      { label: "Departments", href: "/admin/departments", icon: Building2 },
      { label: "Programs", href: "/admin/programs", icon: School },
      { label: "Courses", href: "/admin/courses", icon: BookOpen },
      { label: "Semesters", href: "/admin/semesters", icon: CalendarDays },
      {
        label: "Course sections",
        href: "/admin/course-sections",
        icon: Layers,
      },
      {
        label: "Student sections",
        href: "/admin/student-sections",
        icon: Users,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        label: "Enrollments",
        href: "/admin/enrollments",
        icon: ClipboardList,
      },
      { label: "Payments", href: "/admin/payments", icon: Receipt },
      { label: "Exams", href: "/admin/exams", icon: FileText },
      { label: "Results", href: "/admin/results", icon: GraduationCap },
    ],
  },
];

export const NAV_BY_ROLE: Record<Role, NavSection[]> = {
  STUDENT: STUDENT_NAV,
  INSTRUCTOR: INSTRUCTOR_NAV,
  ADMIN: ADMIN_NAV,
  SUPER_ADMIN: ADMIN_NAV,
};

export const PROFILE_HREF_BY_ROLE: Partial<Record<Role, string>> = {
  STUDENT: "/student/profile",
  INSTRUCTOR: "/instructor/profile",
};

export const ROLE_LABEL: Record<Role, string> = {
  STUDENT: "Student",
  INSTRUCTOR: "Instructor",
  ADMIN: "Administrator",
  SUPER_ADMIN: "Super administrator",
};
