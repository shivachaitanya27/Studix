import { dataStore } from './dataStore.js';
import { authService } from './authService.js';

export const academicService = {
  // Get all active colleges
  async getColleges() {
    return dataStore.getColleges();
  },

  // Get departments by college
  async getDepartments(collegeId) {
    return dataStore.getDepartments(collegeId);
  },

  // Get subjects filtered by department, year, semester
  async getSubjects(filters) {
    return dataStore.getSubjects(filters);
  },

  // Complete onboarding for user
  async saveOnboarding({ userId, collegeId, departmentId, academicYear, semester }) {
    const existingUser = await dataStore.findUserById(userId);

    const department = await dataStore.getDepartmentById(departmentId);
    if (!department) {
      throw new Error('Selected department not found.');
    }

    // Auto-resolve college if omitted
    const effectiveCollegeId =
      collegeId ||
      existingUser?.college_id ||
      department.college_id ||
      (await dataStore.getColleges())[0]?.id;

    const updatedUser = await dataStore.updateUser(userId, {
      college_id: effectiveCollegeId,
      department_id: departmentId,
      academic_year: parseInt(academicYear, 10),
      semester: parseInt(semester, 10)
    });

    const enrichedProfile = await authService.getUserProfile(updatedUser.id);
    const enrolledSubjects = await dataStore.getSubjects({
      departmentId,
      year: academicYear,
      semester
    });

    return {
      user: enrichedProfile,
      subjects: enrolledSubjects
    };
  }
};
