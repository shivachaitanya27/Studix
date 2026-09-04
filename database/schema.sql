-- ==============================================================================
-- STUDIX — ENTERPRISE MASTER DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- Target Platform: Supabase PostgreSQL
-- ==============================================================================

-- 1. ENUMS & EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('STUDENT', 'FACULTY', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE resource_type AS ENUM (
        'PREVIOUS_PAPER', 
        'MID_1', 
        'MID_2', 
        'MODEL_PAPER', 
        'SEMESTER_PAPER', 
        'INTERNAL_PAPER', 
        'SUBJECT_NOTES', 
        'UNIT_NOTES', 
        'FACULTY_NOTES', 
        'STUDENT_NOTES', 
        'LAB_MANUAL', 
        'PPT', 
        'ASSIGNMENT', 
        'REFERENCE_MATERIAL'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE upload_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. CORE PLATFORM TABLES

-- 2.1 Colleges Table
CREATE TABLE IF NOT EXISTS colleges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    domain VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2 Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(college_id, code)
);

-- 2.3 Users Table (Profile linking to Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY, -- references auth.users(id) in Supabase
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role user_role DEFAULT 'STUDENT',
    college_id UUID REFERENCES colleges(id),
    department_id UUID REFERENCES departments(id),
    academic_year INT CHECK (academic_year BETWEEN 1 AND 4),
    semester INT CHECK (semester BETWEEN 1 AND 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.4 Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    year INT NOT NULL CHECK (year BETWEEN 1 AND 4),
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.5 Resources Table
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    year INT NOT NULL CHECK (year BETWEEN 1 AND 4),
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    title VARCHAR(255) NOT NULL,
    resource_type resource_type NOT NULL,
    file_url TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_hash VARCHAR(64) NOT NULL, -- SHA-256 for duplicate detection
    ocr_extracted_text TEXT,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    status upload_status DEFAULT 'PENDING',
    approved_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.6 AI Chats Table
CREATE TABLE IF NOT EXISTS ai_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'New AI Session',
    subject_id UUID REFERENCES subjects(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.7 AI Messages Table
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID REFERENCES ai_chats(id) ON DELETE CASCADE,
    sender VARCHAR(10) CHECK (sender IN ('user', 'assistant')),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.8 Bookmarks Table
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, resource_id)
);

-- 2.9 Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. INDEXES FOR HIGH-SPEED QUERYING
CREATE INDEX IF NOT EXISTS idx_resources_search ON resources (college_id, department_id, year, semester, status);
CREATE INDEX IF NOT EXISTS idx_resources_hash ON resources (file_hash);
CREATE INDEX IF NOT EXISTS idx_ai_messages_chat ON ai_messages (chat_id, created_at);
CREATE INDEX IF NOT EXISTS idx_subjects_lookup ON subjects (department_id, year, semester);
CREATE INDEX IF NOT EXISTS idx_users_college_dept ON users (college_id, department_id);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 4.1 College, Department & Subject Public/Authenticated Reads
DROP POLICY IF EXISTS "Colleges readable by all" ON colleges;
CREATE POLICY "Colleges readable by all" ON colleges FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Departments readable by all" ON departments;
CREATE POLICY "Departments readable by all" ON departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Subjects readable by all" ON subjects;
CREATE POLICY "Subjects readable by all" ON subjects FOR SELECT USING (true);

-- 4.2 Users Policies
DROP POLICY IF EXISTS "Users can read own profile" ON users;
CREATE POLICY "Users can read own profile" ON users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admin view all users" ON users;
CREATE POLICY "Admin view all users" ON users FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN'))
);

-- 4.3 Resources Policies (Strict Multi-Tenant Isolation)
DROP POLICY IF EXISTS "Public Approved Resources" ON resources;
DROP POLICY IF EXISTS "College Strict Approved Resources" ON resources;
CREATE POLICY "College Strict Approved Resources" ON resources FOR SELECT
USING (
    status = 'APPROVED' AND (
        college_id = (SELECT college_id FROM users WHERE users.id = auth.uid())
        OR EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN'))
    )
);

DROP POLICY IF EXISTS "Student Upload View" ON resources;
CREATE POLICY "Student Upload View" ON resources FOR SELECT USING (auth.uid() = uploaded_by);

DROP POLICY IF EXISTS "Student Upload Insert" ON resources;
CREATE POLICY "Student Upload Insert" ON resources FOR INSERT WITH CHECK (
    auth.uid() = uploaded_by
    AND college_id = (SELECT college_id FROM users WHERE users.id = auth.uid())
);

DROP POLICY IF EXISTS "Admin Full Access" ON resources;
CREATE POLICY "Admin Full Access" ON resources FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN'))
);


-- 4.4 AI Chats & Messages Policies
DROP POLICY IF EXISTS "Owner AI Chats Access" ON ai_chats;
CREATE POLICY "Owner AI Chats Access" ON ai_chats FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owner AI Messages Access" ON ai_messages;
CREATE POLICY "Owner AI Messages Access" ON ai_messages FOR ALL USING (
    EXISTS (SELECT 1 FROM ai_chats WHERE ai_chats.id = ai_messages.chat_id AND ai_chats.user_id = auth.uid())
);

-- 4.5 Bookmarks Policies
DROP POLICY IF EXISTS "Owner Bookmarks Access" ON bookmarks;
CREATE POLICY "Owner Bookmarks Access" ON bookmarks FOR ALL USING (auth.uid() = user_id);

-- 4.6 Notifications Policies
DROP POLICY IF EXISTS "Owner Notifications Access" ON notifications;
CREATE POLICY "Owner Notifications Access" ON notifications FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================
-- 5. INITIAL SEED DATA (Colleges, Departments, Subjects)
-- ==============================================================================

-- Colleges (Dhanalakshmi Srinivasan University - Sole Institution)
INSERT INTO colleges (id, name, code, domain, is_active) VALUES
('c1000000-0000-0000-0000-000000000001', 'Dhanalakshmi Srinivasan University Trichy', 'DSU', 'dsuniversity.ac.in', true)
ON CONFLICT (code) DO NOTHING;

-- Departments for DSU
INSERT INTO departments (id, college_id, name, code) VALUES
('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Computer Science and Engineering', 'CSE'),
('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Electronics and Communication Engineering', 'ECE'),
('d1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'Electrical and Electronics Engineering', 'EEE'),
('d1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001', 'Information Technology', 'IT'),
('d1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000001', 'Artificial Intelligence and Data Science', 'AI-DS'),
('d1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000001', 'Artificial Intelligence and Machine Learning', 'AIML'),
('d1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000001', 'Cybersecurity', 'CYB'),
('d1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000001', 'Internet of Things', 'IOT')
ON CONFLICT (college_id, code) DO NOTHING;

-- Subjects for DSU CSE across Years 1-4 & Semesters 1-8
INSERT INTO subjects (department_id, year, semester, name, code) VALUES
-- Year 1 Sem 1
('d1000000-0000-0000-0000-000000000001', 1, 1, 'Matrices and Calculus', 'MA101BS'),
('d1000000-0000-0000-0000-000000000001', 1, 1, 'Engineering Chemistry', 'CH102BS'),
('d1000000-0000-0000-0000-000000000001', 1, 1, 'Programming for Problem Solving (C)', 'CS103ES'),
('d1000000-0000-0000-0000-000000000001', 1, 1, 'Basic Electrical Engineering', 'EE104ES'),

-- Year 1 Sem 2
('d1000000-0000-0000-0000-000000000001', 1, 2, 'Ordinary Differential Equations & Vector Calculus', 'MA201BS'),
('d1000000-0000-0000-0000-000000000001', 1, 2, 'Applied Physics', 'AP202BS'),
('d1000000-0000-0000-0000-000000000001', 1, 2, 'Data Structures', 'CS203ES'),
('d1000000-0000-0000-0000-000000000001', 1, 2, 'English for Skill Enhancement', 'EN204HS'),

-- Year 2 Sem 3
('d1000000-0000-0000-0000-000000000001', 2, 3, 'Discrete Mathematics', 'CS301PC'),
('d1000000-0000-0000-0000-000000000001', 2, 3, 'Digital Logic Design & Computer Organization', 'CS302PC'),
('d1000000-0000-0000-0000-000000000001', 2, 3, 'Object Oriented Programming through Java', 'CS303PC'),
('d1000000-0000-0000-0000-000000000001', 2, 3, 'Database Management Systems', 'CS304PC'),

-- Year 2 Sem 4
('d1000000-0000-0000-0000-000000000001', 2, 4, 'Design and Analysis of Algorithms', 'CS401PC'),
('d1000000-0000-0000-0000-000000000001', 2, 4, 'Operating Systems', 'CS402PC'),
('d1000000-0000-0000-0000-000000000001', 2, 4, 'Formal Languages & Automata Theory', 'CS403PC'),
('d1000000-0000-0000-0000-000000000001', 2, 4, 'Software Engineering', 'CS404PC'),

-- Year 3 Sem 5
('d1000000-0000-0000-0000-000000000001', 3, 5, 'Computer Architecture', 'CS501PC'),
('d1000000-0000-0000-0000-000000000001', 3, 5, 'Intelligence System', 'CS502PC'),
('d1000000-0000-0000-0000-000000000001', 3, 5, 'DBMS', 'CS503PC'),
('d1000000-0000-0000-0000-000000000001', 3, 5, 'Data Science', 'CS504PC'),
('d1000000-0000-0000-0000-000000000001', 3, 5, 'Data Analytics', 'CS505PC'),
('d1000000-0000-0000-0000-000000000001', 3, 5, 'Introduction to Sensor Technology', 'CS506PC'),

-- Year 3 Sem 6
('d1000000-0000-0000-0000-000000000001', 3, 6, 'Machine Learning', 'CS601PC'),
('d1000000-0000-0000-0000-000000000001', 3, 6, 'Cryptography & Network Security', 'CS602PC'),
('d1000000-0000-0000-0000-000000000001', 3, 6, 'Cloud Computing', 'CS603PC'),

-- Year 4 Sem 7
('d1000000-0000-0000-0000-000000000001', 4, 7, 'Big Data Analytics', 'CS701PC'),
('d1000000-0000-0000-0000-000000000001', 4, 7, 'Deep Learning', 'CS702PC'),
('d1000000-0000-0000-0000-000000000001', 4, 7, 'Information Retrieval Systems', 'CS703PE'),

-- Year 4 Sem 8
('d1000000-0000-0000-0000-000000000001', 4, 8, 'Distributed Systems', 'CS801PC'),
('d1000000-0000-0000-0000-000000000001', 4, 8, 'Major Project & Industry Internship', 'CS802PR');

-- ==============================================================================
-- 7. STUDENT SUPPORT & FEEDBACK TABLES
-- ==============================================================================

-- 7.1 Student Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    college_name VARCHAR(255),
    department_name VARCHAR(255),
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    status VARCHAR(50) DEFAULT 'OPEN', -- 'OPEN', 'IN_PROGRESS', 'RESOLVED'
    last_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7.2 Student Support Messages
CREATE TABLE IF NOT EXISTS support_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id VARCHAR(255) NOT NULL,
    sender_role VARCHAR(50) NOT NULL, -- 'STUDENT' or 'ADMIN'
    sender_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7.3 First-Time User Exit Feedback
CREATE TABLE IF NOT EXISTS user_feedbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255),
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    college_name VARCHAR(255),
    department_name VARCHAR(255),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    tags TEXT[],
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_user_feedbacks_created_at ON user_feedbacks(created_at DESC);


