-- ============================================================================
-- Momena Khatun Model Academy — Relational Database Schema (SQLite)
-- Designed for complete Smart School Management Platform
-- ============================================================================

PRAGMA foreign_keys = ON;

-- 1. Users Table (Authentication & Accounts)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('SUPER ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'GUARDIAN')) NOT NULL,
  full_name TEXT NOT NULL,
  full_name_bn TEXT,
  email TEXT,
  phone TEXT,
  avatar TEXT,
  status TEXT CHECK(status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')) DEFAULT 'ACTIVE',
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Academic Years
CREATE TABLE IF NOT EXISTS academic_years (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL, -- e.g., '2026'
  is_current INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Classes (Play through Class 9, ready for Class 10)
CREATE TABLE IF NOT EXISTS classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, -- 'Play', 'Nursery', 'KG', 'Class 1', ..., 'Class 9', 'Class 10'
  name_bn TEXT NOT NULL, -- 'প্লে', 'নার্সারি', 'কেজি', '১ম শ্রেণি', ...
  code TEXT UNIQUE NOT NULL,
  numeric_level INTEGER NOT NULL, -- 0 for Play, 1 for Nursery, 2 for KG, 3 for Class 1, etc.
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Sections
CREATE TABLE IF NOT EXISTS sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'A', 'B', 'Rose', 'Padma'
  room_no TEXT,
  capacity INTEGER DEFAULT 40,
  UNIQUE(class_id, name)
);

-- 5. Subjects
CREATE TABLE IF NOT EXISTS subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'Bangla', 'English', 'Mathematics', 'General Science'
  name_bn TEXT NOT NULL,
  code TEXT NOT NULL,
  full_marks REAL DEFAULT 100,
  pass_marks REAL DEFAULT 33,
  is_optional INTEGER DEFAULT 0,
  UNIQUE(class_id, code)
);

-- 6. Teacher Profiles
CREATE TABLE IF NOT EXISTS teachers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  designation TEXT NOT NULL, -- 'Head Teacher', 'Assistant Teacher', 'Senior Teacher'
  qualification TEXT,
  specialization TEXT,
  joining_date DATE,
  salary REAL,
  address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Guardian Profiles
CREATE TABLE IF NOT EXISTS guardians (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  occupation TEXT,
  nid TEXT,
  emergency_contact TEXT,
  address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Student Profiles
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id_code TEXT UNIQUE NOT NULL, -- e.g. 'MKMA-260101'
  roll_no INTEGER NOT NULL,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
  section_id INTEGER REFERENCES sections(id) ON DELETE SET NULL,
  guardian_id INTEGER REFERENCES guardians(id) ON DELETE SET NULL,
  father_name TEXT,
  mother_name TEXT,
  dob DATE,
  gender TEXT CHECK(gender IN ('MALE', 'FEMALE', 'OTHER')),
  blood_group TEXT,
  admission_date DATE,
  previous_school TEXT,
  address TEXT,
  status TEXT CHECK(status IN ('ACTIVE', 'ALUMNI', 'TRANSFERRED')) DEFAULT 'ACTIVE',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Teacher-Subject Assignments
CREATE TABLE IF NOT EXISTS teacher_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  academic_year_id INTEGER NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  is_class_teacher INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(teacher_id, class_id, section_id, subject_id, academic_year_id)
);

-- 10. Attendance Management
CREATE TABLE IF NOT EXISTS attendances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT CHECK(status IN ('PRESENT', 'ABSENT', 'LATE', 'LEAVE')) NOT NULL,
  remarks TEXT,
  marked_by INTEGER REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, date)
);

-- 11. Examinations
CREATE TABLE IF NOT EXISTS exams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  academic_year_id INTEGER NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'First Term Exam 2026', 'Model Test 2026', 'Annual Exam 2026'
  exam_type TEXT CHECK(exam_type IN ('FIRST TERM', 'SECOND TERM', 'ANNUAL', 'MODEL TEST', 'MONTHLY TEST')) NOT NULL,
  start_date DATE,
  end_date DATE,
  is_published INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 12. Exam Marks & Results
CREATE TABLE IF NOT EXISTS exam_marks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  written_marks REAL DEFAULT 0,
  mcq_marks REAL DEFAULT 0,
  practical_marks REAL DEFAULT 0,
  total_marks REAL NOT NULL,
  grade TEXT NOT NULL, -- 'A+', 'A', 'A-', 'B', 'C', 'D', 'F'
  grade_point REAL NOT NULL, -- 5.0, 4.0, 3.5, etc.
  remarks TEXT,
  entered_by INTEGER REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(exam_id, student_id, subject_id)
);

-- 13. Notices & Announcements
CREATE TABLE IF NOT EXISTS notices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK(category IN ('GENERAL', 'ACADEMIC', 'EXAMINATION', 'HOLIDAY', 'ADMISSION', 'EMERGENCY', 'EVENT')) NOT NULL,
  target_audience TEXT CHECK(target_audience IN ('EVERYONE', 'STUDENTS', 'GUARDIANS', 'TEACHERS', 'SPECIFIC_CLASS')) DEFAULT 'EVERYONE',
  target_class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
  priority TEXT CHECK(priority IN ('NORMAL', 'HIGH', 'URGENT')) DEFAULT 'NORMAL',
  is_pinned INTEGER DEFAULT 0,
  attachment_url TEXT,
  publish_date DATE NOT NULL,
  expiry_date DATE,
  status TEXT CHECK(status IN ('PUBLISHED', 'DRAFT', 'ARCHIVED')) DEFAULT 'PUBLISHED',
  created_by INTEGER REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 14. Class Routines / Timetables
CREATE TABLE IF NOT EXISTS class_routines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
  day TEXT CHECK(day IN ('SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY')) NOT NULL,
  period_number INTEGER NOT NULL,
  start_time TEXT NOT NULL, -- e.g. '09:00 AM'
  end_time TEXT NOT NULL,   -- e.g. '09:45 AM'
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
  room_no TEXT,
  UNIQUE(class_id, section_id, day, period_number)
);

-- 15. Exam Routines
CREATE TABLE IF NOT EXISTS exam_routines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  exam_date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  room_no TEXT,
  instructions TEXT,
  UNIQUE(exam_id, class_id, subject_id)
);

-- 16. Homework & Assignments
CREATE TABLE IF NOT EXISTS homeworks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  due_date DATE NOT NULL,
  attachment_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS homework_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  homework_id INTEGER NOT NULL REFERENCES homeworks(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  submission_text TEXT,
  file_url TEXT,
  status TEXT CHECK(status IN ('SUBMITTED', 'LATE', 'REVIEWED')) DEFAULT 'SUBMITTED',
  teacher_feedback TEXT,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(homework_id, student_id)
);

-- 17. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK(type IN ('NOTICE', 'RESULT', 'ATTENDANCE', 'HOMEWORK', 'SYSTEM')) DEFAULT 'SYSTEM',
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 18. Audit & Activity Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  details TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indices for rapid querying
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_attendances_student_date ON attendances(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendances_class_date ON attendances(class_id, date);
CREATE INDEX IF NOT EXISTS idx_exam_marks_exam_student ON exam_marks(exam_id, student_id);
CREATE INDEX IF NOT EXISTS idx_notices_status ON notices(status);
