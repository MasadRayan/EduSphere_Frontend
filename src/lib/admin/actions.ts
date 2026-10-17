/**
 * Admin Server Actions, grouped by entity. Each submodule owns its own
 * "use server" boundary; this barrel keeps the existing import sites stable.
 */
export {
  approveInstructorApplicationAction,
  approveStudentApplicationAction,
  rejectInstructorApplicationAction,
  rejectStudentApplicationAction,
} from "./actions/applications";
export {
  deleteCourseAction,
  deleteCourseSectionAction,
  deleteDepartmentAction,
  deleteProgramAction,
  deleteSemesterAction,
  deleteStudentSectionAction,
  saveCourseAction,
  saveCourseSectionAction,
  saveDepartmentAction,
  saveProgramAction,
  saveSemesterAction,
  saveStudentSectionAction,
} from "./actions/catalog";
export {
  cancelEnrollmentAdminAction,
  overrideRegistrationStatusAction,
} from "./actions/enrollments";
export {
  adminDeleteExamAction,
  adminEnterResultsAction,
  adminSaveExamAction,
  adminUpdateResultAction,
} from "./actions/exams";
export {
  deleteInstructorAdminAction,
  updateInstructorAdminAction,
} from "./actions/instructors";
export {
  assignStudentSectionAction,
  setStudentSemesterAction,
  updateStudentStatusAction,
} from "./actions/students";
export {
  deleteUserAction,
  updateUserRoleAction,
  updateUserStatusAction,
} from "./actions/users";
