// Initial seed data reflecting schema.sql exactly
export const initialColleges = [
  {
    id: 'c1000000-0000-0000-0000-000000000001',
    name: 'Dhanalakshmi Srinivasan University Trichy',
    code: 'DSU',
    domain: 'dsuniversity.ac.in',
    is_active: true,
    created_at: new Date().toISOString()
  }
];

const deptNames = [
  { name: 'Computer Science and Engineering', code: 'CSE' },
  { name: 'Electronics and Communication Engineering', code: 'ECE' },
  { name: 'Electrical and Electronics Engineering', code: 'EEE' },
  { name: 'Information Technology', code: 'IT' },
  { name: 'Artificial Intelligence and Data Science', code: 'AI-DS' },
  { name: 'Artificial Intelligence and Machine Learning', code: 'AIML' },
  { name: 'Cybersecurity', code: 'CYB' },
  { name: 'Internet of Things', code: 'IOT' },
];

export const initialDepartments = [
  // Departments for DSU
  ...deptNames.map((d, i) => ({
    id: `d1000000-0000-0000-0000-00000000000${i + 1}`,
    college_id: 'c1000000-0000-0000-0000-000000000001',
    name: d.name,
    code: d.code,
    created_at: new Date().toISOString()
  }))
];


export const initialSubjects = [
  // Year 1 Sem 1 - CSE
  {
    id: 's1000000-0000-0000-0000-000000000001',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 1,
    semester: 1,
    name: 'Matrices and Calculus',
    code: 'MA101BS',
    created_at: new Date().toISOString()
  },
  {
    id: 's1000000-0000-0000-0000-000000000002',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 1,
    semester: 1,
    name: 'Engineering Chemistry',
    code: 'CH102BS',
    created_at: new Date().toISOString()
  },
  {
    id: 's1000000-0000-0000-0000-000000000003',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 1,
    semester: 1,
    name: 'Programming for Problem Solving (C)',
    code: 'CS103ES',
    created_at: new Date().toISOString()
  },
  {
    id: 's1000000-0000-0000-0000-000000000004',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 1,
    semester: 1,
    name: 'Basic Electrical Engineering',
    code: 'EE104ES',
    created_at: new Date().toISOString()
  },
  // Year 1 Sem 2 - CSE
  {
    id: 's1000000-0000-0000-0000-000000000005',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 1,
    semester: 2,
    name: 'Ordinary Differential Equations & Vector Calculus',
    code: 'MA201BS',
    created_at: new Date().toISOString()
  },
  {
    id: 's1000000-0000-0000-0000-000000000006',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 1,
    semester: 2,
    name: 'Applied Physics',
    code: 'AP202BS',
    created_at: new Date().toISOString()
  },
  {
    id: 's1000000-0000-0000-0000-000000000007',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 1,
    semester: 2,
    name: 'Data Structures',
    code: 'CS203ES',
    created_at: new Date().toISOString()
  },
  {
    id: 's1000000-0000-0000-0000-000000000008',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 1,
    semester: 2,
    name: 'English for Skill Enhancement',
    code: 'EN204HS',
    created_at: new Date().toISOString()
  },
  // Year 2 Sem 3 - CSE
  {
    id: 's1000000-0000-0000-0000-000000000009',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 2,
    semester: 3,
    name: 'Discrete Mathematics',
    code: 'CS301PC',
    created_at: new Date().toISOString()
  },
  {
    id: 's1000000-0000-0000-0000-000000000010',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 2,
    semester: 3,
    name: 'Digital Logic Design & Computer Organization',
    code: 'CS302PC',
    created_at: new Date().toISOString()
  },
  {
    id: 's1000000-0000-0000-0000-000000000011',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 2,
    semester: 3,
    name: 'Object Oriented Programming through Java',
    code: 'CS303PC',
    created_at: new Date().toISOString()
  },
  {
    id: 's1000000-0000-0000-0000-000000000012',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 2,
    semester: 3,
    name: 'Database Management Systems',
    code: 'CS304PC',
    created_at: new Date().toISOString()
  },
  // Year 2 Sem 4 - CSE
  {
    id: 's1000000-0000-0000-0000-000000000013',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 2,
    semester: 4,
    name: 'Design and Analysis of Algorithms',
    code: 'CS401PC',
    created_at: new Date().toISOString()
  },
  {
    id: 's1000000-0000-0000-0000-000000000014',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 2,
    semester: 4,
    name: 'Operating Systems',
    code: 'CS402PC',
    created_at: new Date().toISOString()
  },
  {
    id: 's1000000-0000-0000-0000-000000000015',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 2,
    semester: 4,
    name: 'Formal Languages & Automata Theory',
    code: 'CS403PC',
    created_at: new Date().toISOString()
  },
  {
    id: 's1000000-0000-0000-0000-000000000016',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 2,
    semester: 4,
    name: 'Software Engineering',
    code: 'CS404PC',
    created_at: new Date().toISOString()
  },
  // Year 3 Sem 5 - CSE
  {
    id: 's1000000-0000-0000-0000-000000000017',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 3,
    semester: 5,
    name: 'Computer Architecture',
    code: 'CS501PC',
    created_at: new Date().toISOString()
  },
  {
    id: 's1000000-0000-0000-0000-000000000018',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 3,
    semester: 5,
    name: 'Intelligence System',
    code: 'CS502PC',
    created_at: new Date().toISOString()
  },
  {
    id: 's1000000-0000-0000-0000-000000000019',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 3,
    semester: 5,
    name: 'DBMS',
    code: 'CS503PC',
    created_at: new Date().toISOString()
  },
  {
    id: 's1000000-0000-0000-0000-000000000020',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 3,
    semester: 5,
    name: 'Data Science',
    code: 'CS504PC',
    created_at: new Date().toISOString()
  },
  {
    id: 's1000000-0000-0000-0000-000000000020a',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 3,
    semester: 5,
    name: 'Data Analytics',
    code: 'CS505PC',
    created_at: new Date().toISOString()
  },
  {
    id: 's1000000-0000-0000-0000-000000000020b',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 3,
    semester: 5,
    name: 'Introduction to Sensor Technology',
    code: 'CS506PC',
    created_at: new Date().toISOString()
  },

  // Year 3 Sem 6 - CSE
  {
    id: 's1000000-0000-0000-0000-000000000021',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 3,
    semester: 6,
    name: 'Machine Learning',
    code: 'CS601PC',
    created_at: new Date().toISOString()
  },
  {
    id: 's1000000-0000-0000-0000-000000000022',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 3,
    semester: 6,
    name: 'Cryptography & Network Security',
    code: 'CS602PC',
    created_at: new Date().toISOString()
  },
  {
    id: 's1000000-0000-0000-0000-000000000023',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 3,
    semester: 6,
    name: 'Cloud Computing',
    code: 'CS603PC',
    created_at: new Date().toISOString()
  },
  // Year 4 Sem 7 - CSE
  {
    id: 's1000000-0000-0000-0000-000000000024',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 4,
    semester: 7,
    name: 'Big Data Analytics',
    code: 'CS701PC',
    created_at: new Date().toISOString()
  },
  {
    id: 's1000000-0000-0000-0000-000000000025',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 4,
    semester: 7,
    name: 'Deep Learning',
    code: 'CS702PC',
    created_at: new Date().toISOString()
  },
  {
    id: 's1000000-0000-0000-0000-000000000026',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 4,
    semester: 7,
    name: 'Information Retrieval Systems',
    code: 'CS703PE',
    created_at: new Date().toISOString()
  },
  // Year 4 Sem 8 - CSE
  {
    id: 's1000000-0000-0000-0000-000000000027',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 4,
    semester: 8,
    name: 'Distributed Systems',
    code: 'CS801PC',
    created_at: new Date().toISOString()
  },
  {
    id: 's1000000-0000-0000-0000-000000000028',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    year: 4,
    semester: 8,
    name: 'Major Project & Industry Internship',
    code: 'CS802PR',
    created_at: new Date().toISOString()
  }
];

// Pre-seeded verified scholars across all departments (password: Studix@2026)
export const initialUsers = [
  {
    id: 'u1000000-0000-0000-0000-000000000001',
    email: 'vshivachaitanya7@gmail.com',
    password_hash: '$2a$10$wT0X1L3U8E4T9p0R7s9vU.w2k8q6ZzY1tZ5R0a1B2c3D4e5F6g7H.',
    full_name: 'Shiva Chaitanya',
    role: 'ADMIN',
    college_id: 'c1000000-0000-0000-0000-000000000001',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    academic_year: 3,
    semester: 6,
    created_at: new Date().toISOString()
  },
  {
    id: 'u1000000-0000-0000-0000-000000000002',
    email: 'aids.scholar@dsuniversity.ac.in',
    password_hash: '$2a$10$wT0X1L3U8E4T9p0R7s9vU.w2k8q6ZzY1tZ5R0a1B2c3D4e5F6g7H.',
    full_name: 'Priya Sharma',
    role: 'STUDENT',
    college_id: 'c1000000-0000-0000-0000-000000000001',
    department_id: 'd1000000-0000-0000-0000-000000000005', // AI-DS
    academic_year: 3,
    semester: 5,
    created_at: new Date().toISOString()
  },
  {
    id: 'u1000000-0000-0000-0000-000000000003',
    email: 'ece.scholar@dsuniversity.ac.in',
    password_hash: '$2a$10$wT0X1L3U8E4T9p0R7s9vU.w2k8q6ZzY1tZ5R0a1B2c3D4e5F6g7H.',
    full_name: 'Rahul Varma',
    role: 'STUDENT',
    college_id: 'c1000000-0000-0000-0000-000000000001',
    department_id: 'd1000000-0000-0000-0000-000000000002', // ECE
    academic_year: 2,
    semester: 4,
    created_at: new Date().toISOString()
  },
  {
    id: 'u1000000-0000-0000-0000-000000000004',
    email: 'eee.scholar@dsuniversity.ac.in',
    password_hash: '$2a$10$wT0X1L3U8E4T9p0R7s9vU.w2k8q6ZzY1tZ5R0a1B2c3D4e5F6g7H.',
    full_name: 'Ananya Rao',
    role: 'STUDENT',
    college_id: 'c1000000-0000-0000-0000-000000000001',
    department_id: 'd1000000-0000-0000-0000-000000000003', // EEE
    academic_year: 3,
    semester: 6,
    created_at: new Date().toISOString()
  },
  {
    id: 'u1000000-0000-0000-0000-000000000005',
    email: 'cyb.scholar@dsuniversity.ac.in',
    password_hash: '$2a$10$wT0X1L3U8E4T9p0R7s9vU.w2k8q6ZzY1tZ5R0a1B2c3D4e5F6g7H.',
    full_name: 'Karthik Nair',
    role: 'STUDENT',
    college_id: 'c1000000-0000-0000-0000-000000000001',
    department_id: 'd1000000-0000-0000-0000-000000000007', // CYB
    academic_year: 4,
    semester: 7,
    created_at: new Date().toISOString()
  },
  {
    id: 'u1000000-0000-0000-0000-000000000006',
    email: 'aiml.scholar@dsuniversity.ac.in',
    password_hash: '$2a$10$wT0X1L3U8E4T9p0R7s9vU.w2k8q6ZzY1tZ5R0a1B2c3D4e5F6g7H.',
    full_name: 'Sneha Reddy',
    role: 'STUDENT',
    college_id: 'c1000000-0000-0000-0000-000000000001',
    department_id: 'd1000000-0000-0000-0000-000000000006', // AIML
    academic_year: 2,
    semester: 3,
    created_at: new Date().toISOString()
  },
  {
    id: 'u1000000-0000-0000-0000-000000000007',
    email: 'it.scholar@dsuniversity.ac.in',
    password_hash: '$2a$10$wT0X1L3U8E4T9p0R7s9vU.w2k8q6ZzY1tZ5R0a1B2c3D4e5F6g7H.',
    full_name: 'Vikram Joshi',
    role: 'STUDENT',
    college_id: 'c1000000-0000-0000-0000-000000000001',
    department_id: 'd1000000-0000-0000-0000-000000000004', // IT
    academic_year: 3,
    semester: 5,
    created_at: new Date().toISOString()
  },
  {
    id: 'u1000000-0000-0000-0000-000000000008',
    email: 'iot.scholar@dsuniversity.ac.in',
    password_hash: '$2a$10$wT0X1L3U8E4T9p0R7s9vU.w2k8q6ZzY1tZ5R0a1B2c3D4e5F6g7H.',
    full_name: 'Meera Iyer',
    role: 'STUDENT',
    college_id: 'c1000000-0000-0000-0000-000000000001',
    department_id: 'd1000000-0000-0000-0000-000000000008', // IOT
    academic_year: 1,
    semester: 2,
    created_at: new Date().toISOString()
  }
];

// Clean empty resources - no demo or sample files included
export const initialResources = [];

export const initialBookmarks = [];


