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

// Pre-seeded demo users (password: Studix@2026)
export const initialUsers = [
  {
    id: 'u1000000-0000-0000-0000-000000000001',
    email: 'student@studix.edu',
    password_hash: '$2a$10$wT0X1L3U8E4T9p0R7s9vU.w2k8q6ZzY1tZ5R0a1B2c3D4e5F6g7H.', // Studix@2026
    full_name: 'Alex Rivera',
    role: 'STUDENT',
    college_id: 'c1000000-0000-0000-0000-000000000001',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    academic_year: 3,
    semester: 5,
    created_at: new Date().toISOString()
  },
  {
    id: 'u1000000-0000-0000-0000-000000000002',
    email: 'admin@studix.edu',
    password_hash: '$2a$10$wT0X1L3U8E4T9p0R7s9vU.w2k8q6ZzY1tZ5R0a1B2c3D4e5F6g7H.', // Studix@2026
    full_name: 'Prof. Sarah Jenkins',
    role: 'ADMIN',
    college_id: 'c1000000-0000-0000-0000-000000000001',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    academic_year: null,
    semester: null,
    created_at: new Date().toISOString()
  }
];

// Pre-seeded initial approved academic resources
export const initialResources = [
  // 1. Previous Semester Papers
  {
    id: 'r1000000-0000-0000-0000-000000000001',
    college_id: 'c1000000-0000-0000-0000-000000000001',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    subject_id: 's1000000-0000-0000-0000-000000000017', // Computer Networks
    year: 3,
    semester: 5,
    title: 'Computer Networks - End Semester University Exam Paper 2025',
    resource_type: 'SEMESTER_PAPER',
    file_url: 'http://localhost:5000/uploads/academic-resources/sample_exam_paper.pdf',
    file_path: 'academic-resources/sample_exam_paper.pdf',
    file_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    ocr_extracted_text: 'JNTUH B.Tech III Year I Semester Regular Examinations. Computer Networks (CS501PC). Time: 3 Hours. Max Marks: 75.',
    uploaded_by: 'u1000000-0000-0000-0000-000000000002',
    status: 'APPROVED',
    approved_by: 'u1000000-0000-0000-0000-000000000002',
    rejection_reason: null,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'r1000000-0000-0000-0000-000000000002',
    college_id: 'c1000000-0000-0000-0000-000000000001',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    subject_id: 's1000000-0000-0000-0000-000000000018', // Compiler Design
    year: 3,
    semester: 5,
    title: 'Compiler Design - Previous Year University Question Paper',
    resource_type: 'PREVIOUS_PAPER',
    file_url: 'http://localhost:5000/uploads/academic-resources/sample_exam_paper.pdf',
    file_path: 'academic-resources/sample_exam_paper.pdf',
    file_hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    ocr_extracted_text: 'Phases of compiler, Lexical Analysis, Top Down & Bottom Up Parsing, LR Parsers, Code Optimization techniques.',
    uploaded_by: 'u1000000-0000-0000-0000-000000000002',
    status: 'APPROVED',
    approved_by: 'u1000000-0000-0000-0000-000000000002',
    rejection_reason: null,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString()
  },

  // 2. Mid Exams
  {
    id: 'r1000000-0000-0000-0000-000000000003',
    college_id: 'c1000000-0000-0000-0000-000000000001',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    subject_id: 's1000000-0000-0000-0000-000000000017', // Computer Networks
    year: 3,
    semester: 5,
    title: 'Computer Networks - Mid 1 Descriptive & Objective Examination',
    resource_type: 'MID_1',
    file_url: 'http://localhost:5000/uploads/academic-resources/sample_exam_paper.pdf',
    file_path: 'academic-resources/sample_exam_paper.pdf',

    file_hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    ocr_extracted_text: 'OSI Reference Model vs TCP/IP Protocol Suite, Physical Layer transmission media, Framing, CRC Checksum.',
    uploaded_by: 'u1000000-0000-0000-0000-000000000001',
    status: 'APPROVED',
    approved_by: 'u1000000-0000-0000-0000-000000000002',
    rejection_reason: null,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'r1000000-0000-0000-0000-000000000004',
    college_id: 'c1000000-0000-0000-0000-000000000001',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    subject_id: 's1000000-0000-0000-0000-000000000019', // Artificial Intelligence
    year: 3,
    semester: 5,
    title: 'Artificial Intelligence - Mid 2 Exam Question Paper with Keys',
    resource_type: 'MID_2',
    file_url: 'https://example.com/resources/ai-mid2.pdf',
    file_path: 'academic-resources/ai-mid2.pdf',
    file_hash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    ocr_extracted_text: 'A* Algorithm heuristics, Minimax with Alpha-Beta pruning, First Order Predicate Logic, Resolution Refutation.',
    uploaded_by: 'u1000000-0000-0000-0000-000000000001',
    status: 'APPROVED',
    approved_by: 'u1000000-0000-0000-0000-000000000002',
    rejection_reason: null,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },

  // 3. Study Notes
  {
    id: 'r1000000-0000-0000-0000-000000000005',
    college_id: 'c1000000-0000-0000-0000-000000000001',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    subject_id: 's1000000-0000-0000-0000-000000000017', // Computer Networks
    year: 3,
    semester: 5,
    title: 'Unit 1 & 2 Complete Lecture Notes by HOD',
    resource_type: 'FACULTY_NOTES',
    file_url: 'https://example.com/resources/cn-unit12-notes.pdf',
    file_path: 'academic-resources/cn-unit12-notes.pdf',
    file_hash: '8792e352ef2e5330a7d97cb65860d5dd7dbbe7163013b19688eb4e7b8979116e',
    ocr_extracted_text: 'Comprehensive reference notes covering OSI 7 layers, network topologies, sliding window protocols, Go-Back-N, Selective Repeat.',
    uploaded_by: 'u1000000-0000-0000-0000-000000000002',
    status: 'APPROVED',
    approved_by: 'u1000000-0000-0000-0000-000000000002',
    rejection_reason: null,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'r1000000-0000-0000-0000-000000000006',
    college_id: 'c1000000-0000-0000-0000-000000000001',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    subject_id: 's1000000-0000-0000-0000-000000000020', // Web Technologies
    year: 3,
    semester: 5,
    title: 'Full Stack Web Tech - Handwritten Exam Revision Notes',
    resource_type: 'UNIT_NOTES',
    file_url: 'https://example.com/resources/wt-revision.pdf',
    file_path: 'academic-resources/wt-revision.pdf',
    file_hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    ocr_extracted_text: 'HTML5 Semantic elements, CSS Flexbox & Grid, JavaScript ES6 closures & promises, Node Express REST API architecture.',
    uploaded_by: 'u1000000-0000-0000-0000-000000000001',
    status: 'APPROVED',
    approved_by: 'u1000000-0000-0000-0000-000000000002',
    rejection_reason: null,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString()
  },

  // 4. Lab Manuals & PPTs
  {
    id: 'r1000000-0000-0000-0000-000000000007',
    college_id: 'c1000000-0000-0000-0000-000000000001',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    subject_id: 's1000000-0000-0000-0000-000000000018', // Compiler Design
    year: 3,
    semester: 5,
    title: 'Compiler Design Lab Manual with Lex & Yacc Programs',
    resource_type: 'LAB_MANUAL',
    file_url: 'https://example.com/resources/cd-lab-manual.pdf',
    file_path: 'academic-resources/cd-lab-manual.pdf',
    file_hash: 'd04b98f48e8f8bcc15c6ae5ac050801cd6dcfd428fb5f9e65c4e16e7807340fa',
    ocr_extracted_text: 'JNTUH Department of CSE. CD Lab Manual. Program 1: Tokenizer in C. Program 2: Lexical Analyzer using LEX. Program 3: Parser in YACC.',
    uploaded_by: 'u1000000-0000-0000-0000-000000000002',
    status: 'APPROVED',
    approved_by: 'u1000000-0000-0000-0000-000000000002',
    rejection_reason: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'r1000000-0000-0000-0000-000000000008',
    college_id: 'c1000000-0000-0000-0000-000000000001',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    subject_id: 's1000000-0000-0000-0000-000000000019', // AI
    year: 3,
    semester: 5,
    title: 'Knowledge Representation & Expert Systems Slides',
    resource_type: 'PPT',
    file_url: 'https://example.com/resources/ai-kr-slides.pdf',
    file_path: 'academic-resources/ai-kr-slides.pdf',
    file_hash: '6a598006e8b4e782e4e4a055ff278d91c1b18d2d6ee9ec25225d202ac4cfa88b',
    ocr_extracted_text: 'Semantic Networks, Conceptual Dependencies, Frames, Scripts, Production Rules in Expert Systems.',
    uploaded_by: 'u1000000-0000-0000-0000-000000000002',
    status: 'APPROVED',
    approved_by: 'u1000000-0000-0000-0000-000000000002',
    rejection_reason: null,
    created_at: new Date().toISOString()
  }
];

export const initialBookmarks = [
  {
    id: 'b1000000-0000-0000-0000-000000000001',
    user_id: 'u1000000-0000-0000-0000-000000000001', // Alex Rivera
    resource_id: 'r1000000-0000-0000-0000-000000000001',
    created_at: new Date().toISOString()
  }
];

