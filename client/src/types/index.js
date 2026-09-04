/**
 * @typedef {'STUDENT' | 'FACULTY' | 'ADMIN' | 'SUPER_ADMIN'} UserRole
 */

/**
 * @typedef {'PREVIOUS_PAPER' | 'MID_1' | 'MID_2' | 'MODEL_PAPER' | 'SEMESTER_PAPER' | 'INTERNAL_PAPER' | 'SUBJECT_NOTES' | 'UNIT_NOTES' | 'FACULTY_NOTES' | 'STUDENT_NOTES' | 'LAB_MANUAL' | 'PPT' | 'ASSIGNMENT' | 'REFERENCE_MATERIAL'} ResourceType
 */

/**
 * @typedef {'PENDING' | 'APPROVED' | 'REJECTED'} UploadStatus
 */

/**
 * @typedef {Object} College
 * @property {string} id - UUID of the college
 * @property {string} name - Official name of the college / university
 * @property {string} code - Short code (e.g. JNTUH-CEH)
 * @property {string} domain - Domain name (e.g. jntuh.ac.in)
 * @property {boolean} is_active - Status flag
 * @property {string} [created_at] - Creation timestamp
 */

/**
 * @typedef {Object} Department
 * @property {string} id - UUID of the department
 * @property {string} college_id - Foreign key to College
 * @property {string} name - Name (e.g. Computer Science and Engineering)
 * @property {string} code - Code (e.g. CSE)
 * @property {string} [created_at] - Creation timestamp
 */

/**
 * @typedef {Object} Subject
 * @property {string} id - UUID of the subject
 * @property {string} department_id - Foreign key to Department
 * @property {number} year - Academic year (1-4)
 * @property {number} semester - Semester (1-8)
 * @property {string} name - Subject title
 * @property {string} code - Subject course code (e.g. CS501PC)
 * @property {string} [created_at] - Creation timestamp
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} id - UUID
 * @property {string} email - Email address
 * @property {string} full_name - Display name
 * @property {UserRole} role - Role of the user
 * @property {string|null} college_id - Associated college ID
 * @property {string|null} department_id - Associated department ID
 * @property {number|null} academic_year - Year (1-4)
 * @property {number|null} semester - Semester (1-8)
 * @property {College|null} [college] - Expanded college object
 * @property {Department|null} [department] - Expanded department object
 * @property {boolean} [isOnboardingComplete] - Onboarding completion flag
 * @property {string} [created_at] - Timestamp
 */

/**
 * @typedef {Object} AcademicContext
 * @property {College|null} selectedCollege
 * @property {Department|null} selectedDepartment
 * @property {number|null} selectedYear
 * @property {number|null} selectedSemester
 * @property {Subject[]} subjects
 * @property {boolean} isOnboardingComplete
 */

/**
 * @typedef {Object} AuthState
 * @property {UserProfile|null} user
 * @property {string|null} token
 * @property {boolean} isAuthenticated
 * @property {boolean} isLoading
 * @property {string|null} error
 */

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'studix_auth_token',
  USER_DATA: 'studix_user_data',
  ACADEMIC_CONTEXT: 'studix_academic_context',
  THEME_MODE: 'studix_theme_mode'
};
