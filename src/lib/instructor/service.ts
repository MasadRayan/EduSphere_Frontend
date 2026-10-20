import "server-only";
import { endpoints } from "@/lib/api/endpoints";
import { serverFetch, serverFetchData } from "@/lib/api/server-fetch";
import type {
  CourseSection,
  InstructorAnalytics,
  InstructorApplication,
  InstructorAttendanceRecord,
  InstructorExam,
  InstructorMe,
  InstructorResultRow,
  SectionStudent,
} from "@/types/entities";

function toQuery(params: Record<string, string | number | undefined>) {
  const query: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      query[key] = String(value);
    }
  }
  return query;
}

export function getInstructorMe(): Promise<InstructorMe> {
  return serverFetchData<InstructorMe>(endpoints.instructor.me);
}

export function getInstructorApplication(): Promise<InstructorApplication | null> {
  return serverFetchData<InstructorApplication | null>(
    endpoints.instructor.application,
  );
}

export function getInstructorAnalytics(params: {
  semesterId?: string;
}): Promise<InstructorAnalytics> {
  return serverFetchData<InstructorAnalytics>(endpoints.analytics.instructor, {
    query: toQuery({ semesterId: params.semesterId }),
  });
}

export async function getMySections(
  semesterId?: string,
): Promise<CourseSection[]> {
  const me = await getInstructorMe();
  const sections = me.instructorProfile?.courseSections ?? [];
  if (!semesterId) {
    return sections;
  }
  return sections.filter((section) => section.semesterId === semesterId);
}

export async function listSectionExams(
  courseSectionId?: string,
): Promise<InstructorExam[]> {
  const envelope = await serverFetch<InstructorExam[]>(endpoints.exams, {
    query: toQuery({ courseSectionId, limit: 100 }),
  });
  return envelope.data;
}

export async function listSectionAttendance(
  courseSectionId: string,
  date?: string,
): Promise<InstructorAttendanceRecord[]> {
  const envelope = await serverFetch<InstructorAttendanceRecord[]>(
    endpoints.attendance,
    {
      query: toQuery({ courseSectionId, date }),
    },
  );
  return envelope.data;
}

export async function listSectionResults(
  courseSectionId: string,
): Promise<InstructorResultRow[]> {
  const envelope = await serverFetch<InstructorResultRow[]>(endpoints.results, {
    query: toQuery({ courseSectionId, limit: 100 }),
  });
  return envelope.data;
}

export function getExamResults(examId: string): Promise<InstructorResultRow[]> {
  return serverFetchData<InstructorResultRow[]>(
    `${endpoints.exams}/${examId}/results`,
  );
}

/**
 * The roster comes from the section students endpoint, which reads course
 * registrations. Attendance and result rows are no longer used to guess who is
 * enrolled, so a student appears before their first class is recorded.
 *
 * The top-level `studentId` on attendance and result rows is the StudentProfile
 * id that enrollment checks use, while the nested `student.studentId` is the
 * display code (STU-2023-0001). The profile id is what POST bodies must carry.
 */
export interface RosterEntry {
  profileId: string;
  student: SectionStudent;
}

export async function getSectionRoster(
  courseSectionId: string,
): Promise<RosterEntry[]> {
  const data = await serverFetchData<{ students: SectionStudent[] }>(
    `${endpoints.courseSections}/${courseSectionId}/students`,
  );

  return data.students.map((student) => ({
    profileId: student.id,
    student,
  }));
}
