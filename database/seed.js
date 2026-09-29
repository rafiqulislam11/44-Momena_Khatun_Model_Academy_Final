const bcrypt = require('bcryptjs');
const db = require('../backend/config/db');

async function seed() {
  console.log('🌱 Starting Database Seeding for Momena Khatun Model Academy...');

  // 1. Academic Years
  db.run(`INSERT OR IGNORE INTO academic_years (id, name, is_current, start_date, end_date)
          VALUES (1, '2026', 1, '2026-01-01', '2026-12-31')`);

  // 2. Classes (Play through Class 9, ready for Class 10)
  const classesList = [
    { id: 1, name: 'Play', name_bn: 'প্লে', code: 'PLAY', level: 0 },
    { id: 2, name: 'Nursery', name_bn: 'নার্সারি', code: 'NUR', level: 1 },
    { id: 3, name: 'KG', name_bn: 'কেজি', code: 'KG', level: 2 },
    { id: 4, name: 'Class 1', name_bn: '১ম শ্রেণি', code: 'CLS1', level: 3 },
    { id: 5, name: 'Class 2', name_bn: '২য় শ্রেণি', code: 'CLS2', level: 4 },
    { id: 6, name: 'Class 3', name_bn: '৩য় শ্রেণি', code: 'CLS3', level: 5 },
    { id: 7, name: 'Class 4', name_bn: '৪র্থ শ্রেণি', code: 'CLS4', level: 6 },
    { id: 8, name: 'Class 5', name_bn: '৫ম শ্রেণি', code: 'CLS5', level: 7 },
    { id: 9, name: 'Class 6', name_bn: '৬ষ্ঠ শ্রেণি', code: 'CLS6', level: 8 },
    { id: 10, name: 'Class 7', name_bn: '৭ম শ্রেণি', code: 'CLS7', level: 9 },
    { id: 11, name: 'Class 8', name_bn: '৮ম শ্রেণি', code: 'CLS8', level: 10 },
    { id: 12, name: 'Class 9', name_bn: '৯ম শ্রেণি', code: 'CLS9', level: 11 },
    { id: 13, name: 'Class 10', name_bn: '১০ম শ্রেণি', code: 'CLS10', level: 12 }
  ];

  for (const c of classesList) {
    db.run(`INSERT OR IGNORE INTO classes (id, name, name_bn, code, numeric_level)
            VALUES (?, ?, ?, ?, ?)`, [c.id, c.name, c.name_bn, c.code, c.level]);

    // Sections A and B
    db.run(`INSERT OR IGNORE INTO sections (class_id, name, room_no, capacity)
            VALUES (?, 'A', 'Room 101', 40)`, [c.id]);
    db.run(`INSERT OR IGNORE INTO sections (class_id, name, room_no, capacity)
            VALUES (?, 'B', 'Room 102', 40)`, [c.id]);
  }

  // 3. Subjects for Classes (Bangla, English, Math, Science, Religion, ICT)
  const subjectsData = [
    { class_id: 10, name: 'Bangla', name_bn: 'বাংলা', code: 'BNG-7', full_marks: 100, pass_marks: 33 },
    { class_id: 10, name: 'English', name_bn: 'ইংরেজি', code: 'ENG-7', full_marks: 100, pass_marks: 33 },
    { class_id: 10, name: 'Mathematics', name_bn: 'গণিত', code: 'MATH-7', full_marks: 100, pass_marks: 33 },
    { class_id: 10, name: 'General Science', name_bn: 'বিজ্ঞান', code: 'SCI-7', full_marks: 100, pass_marks: 33 },
    { class_id: 10, name: 'Islam & Moral Education', name_bn: 'ইসলাম শিক্ষা', code: 'ISL-7', full_marks: 100, pass_marks: 33 },
    { class_id: 10, name: 'ICT', name_bn: 'তথ্য ও যোগাযোগ প্রযুক্তি', code: 'ICT-7', full_marks: 50, pass_marks: 17 },

    { class_id: 8, name: 'Bangla', name_bn: 'বাংলা', code: 'BNG-5', full_marks: 100, pass_marks: 33 },
    { class_id: 8, name: 'English', name_bn: 'ইংরেজি', code: 'ENG-5', full_marks: 100, pass_marks: 33 },
    { class_id: 8, name: 'Mathematics', name_bn: 'গণিত', code: 'MATH-5', full_marks: 100, pass_marks: 33 },
    { class_id: 8, name: 'Primary Science', name_bn: 'প্রাথমিক বিজ্ঞান', code: 'SCI-5', full_marks: 100, pass_marks: 33 }
  ];

  for (const s of subjectsData) {
    db.run(`INSERT OR IGNORE INTO subjects (class_id, name, name_bn, code, full_marks, pass_marks)
            VALUES (?, ?, ?, ?, ?, ?)`, [s.class_id, s.name, s.name_bn, s.code, s.full_marks, s.pass_marks]);
  }

  // 4. Passwords
  const adminPass = await bcrypt.hash('Admin@123', 10);
  const teacherPass = await bcrypt.hash('Teacher@123', 10);
  const studentPass = await bcrypt.hash('Student@123', 10);
  const guardianPass = await bcrypt.hash('Guardian@123', 10);

  // 5. Users
  // Super Admin
  db.run(`INSERT OR IGNORE INTO users (id, username, password_hash, role, full_name, full_name_bn, email, phone)
          VALUES (1, 'superadmin', ?, 'SUPER ADMIN', 'Md. Sadman Hossain Sakib', 'মোঃ সাদমান হোসাইন সাকিব', 'director@momenamodel.edu.bd', '01771-907474')`, [adminPass]);

  // Admin
  db.run(`INSERT OR IGNORE INTO users (id, username, password_hash, role, full_name, full_name_bn, email, phone)
          VALUES (2, 'admin', ?, 'ADMIN', 'Academic Administrator', 'একাডেমিক অ্যাডমিনিস্ট্রেটর', 'admin@momenamodel.edu.bd', '01771-907474')`, [adminPass]);

  // Teachers
  db.run(`INSERT OR IGNORE INTO users (id, username, password_hash, role, full_name, full_name_bn, email, phone)
          VALUES (3, 'teacher.math', ?, 'TEACHER', 'Md. Rafiqul Islam', 'মোঃ রফিকুল ইসলাম', 'rafiq.math@momenamodel.edu.bd', '01712-345678')`, [teacherPass]);

  db.run(`INSERT OR IGNORE INTO users (id, username, password_hash, role, full_name, full_name_bn, email, phone)
          VALUES (4, 'teacher.science', ?, 'TEACHER', 'Nasrin Sultana', 'নাসরিন সুলতানা', 'nasrin.sci@momenamodel.edu.bd', '01723-456789')`, [teacherPass]);

  // Guardian
  db.run(`INSERT OR IGNORE INTO users (id, username, password_hash, role, full_name, full_name_bn, email, phone)
          VALUES (5, 'guardian.rofiq', ?, 'GUARDIAN', 'Rofiqul Islam (Parent)', 'মোঃ রফিকুল ইসলাম (অভিভাবক)', 'guardian.rofiq@gmail.com', '01734-567890')`, [guardianPass]);

  // Students
  db.run(`INSERT OR IGNORE INTO users (id, username, password_hash, role, full_name, full_name_bn, email, phone)
          VALUES (6, 'student.101', ?, 'STUDENT', 'Abdullah Al Mamun', 'আব্দুল্লাহ আল মামুন', 'student101@momenamodel.edu.bd', '01734-567890')`, [studentPass]);

  db.run(`INSERT OR IGNORE INTO users (id, username, password_hash, role, full_name, full_name_bn, email, phone)
          VALUES (7, 'student.102', ?, 'STUDENT', 'Fatima Tuj Johra', 'ফাতিমা তুজ জোহরা', 'student102@momenamodel.edu.bd', '01734-567890')`, [studentPass]);

  // 6. Profiles
  // Teacher Profiles
  db.run(`INSERT OR IGNORE INTO teachers (id, user_id, designation, qualification, specialization, joining_date, salary, address)
          VALUES (1, 3, 'Senior Teacher (Mathematics)', 'M.Sc in Mathematics, B.Ed', 'Mathematics & Higher Math', '2019-01-15', 35000, 'Bhaluka, Mymensingh')`);

  db.run(`INSERT OR IGNORE INTO teachers (id, user_id, designation, qualification, specialization, joining_date, salary, address)
          VALUES (2, 4, 'Assistant Teacher (Science)', 'B.Sc (Hons), M.Sc in Physics', 'General Science & ICT', '2020-03-01', 28000, 'Jamirdia, Bhaluka')`);

  // Guardian Profile
  db.run(`INSERT OR IGNORE INTO guardians (id, user_id, occupation, nid, emergency_contact, address)
          VALUES (1, 5, 'Businessman / Social Worker', '1982611928374829', '01734-567890', 'Jamirdia, Hobirbari, Bhaluka')`);

  // Student Profiles
  // Student 1 in Class 7 (id: 10), Section A (id: 19)
  const secClass7A = db.get("SELECT id FROM sections WHERE class_id = 10 AND name = 'A'")?.id || 1;
  const secClass5A = db.get("SELECT id FROM sections WHERE class_id = 8 AND name = 'A'")?.id || 1;

  db.run(`INSERT OR IGNORE INTO students (id, user_id, student_id_code, roll_no, class_id, section_id, guardian_id, father_name, mother_name, dob, gender, blood_group, admission_date, address)
          VALUES (1, 6, 'MKMA-260701', 1, 10, ?, 1, 'Md. Rofiqul Islam', 'Rasheda Begum', '2013-05-14', 'MALE', 'A+', '2026-01-05', 'Jamirdia, Bhaluka')`, [secClass7A]);

  db.run(`INSERT OR IGNORE INTO students (id, user_id, student_id_code, roll_no, class_id, section_id, guardian_id, father_name, mother_name, dob, gender, blood_group, admission_date, address)
          VALUES (2, 7, 'MKMA-260502', 2, 8, ?, 1, 'Md. Rofiqul Islam', 'Rasheda Begum', '2015-08-22', 'FEMALE', 'O+', '2026-01-05', 'Jamirdia, Bhaluka')`, [secClass5A]);

  // 7. Teacher Assignments
  const math7 = db.get("SELECT id FROM subjects WHERE code = 'MATH-7'")?.id || 1;
  const sci7 = db.get("SELECT id FROM subjects WHERE code = 'SCI-7'")?.id || 1;

  db.run(`INSERT OR IGNORE INTO teacher_assignments (teacher_id, class_id, section_id, subject_id, academic_year_id, is_class_teacher)
          VALUES (1, 10, ?, ?, 1, 1)`, [secClass7A, math7]);

  db.run(`INSERT OR IGNORE INTO teacher_assignments (teacher_id, class_id, section_id, subject_id, academic_year_id, is_class_teacher)
          VALUES (2, 10, ?, ?, 1, 0)`, [secClass7A, sci7]);

  // 8. Attendance records (30 days of attendance for students)
  const today = new Date();
  for (let i = 0; i < 25; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (d.getDay() === 5) continue; // Skip Fridays
    const dateStr = d.toISOString().split('T')[0];

    const status1 = (i === 3 || i === 12) ? 'LATE' : (i === 18 ? 'LEAVE' : 'PRESENT');
    const status2 = (i === 7) ? 'ABSENT' : (i === 15 ? 'LATE' : 'PRESENT');

    db.run(`INSERT OR IGNORE INTO attendances (student_id, class_id, section_id, date, status, marked_by)
            VALUES (1, 10, ?, ?, ?, 3)`, [secClass7A, dateStr, status1]);

    db.run(`INSERT OR IGNORE INTO attendances (student_id, class_id, section_id, date, status, marked_by)
            VALUES (2, 8, ?, ?, ?, 3)`, [secClass5A, dateStr, status2]);
  }

  // 9. Exams & Marks
  db.run(`INSERT OR IGNORE INTO exams (id, academic_year_id, name, exam_type, start_date, end_date, is_published)
          VALUES (1, 1, 'First Term Examination 2026', 'FIRST TERM', '2026-04-10', '2026-04-25', 1)`);

  const bng7 = db.get("SELECT id FROM subjects WHERE code = 'BNG-7'")?.id || 1;
  const eng7 = db.get("SELECT id FROM subjects WHERE code = 'ENG-7'")?.id || 1;
  const isl7 = db.get("SELECT id FROM subjects WHERE code = 'ISL-7'")?.id || 1;

  // Student 1 marks in Class 7
  db.run(`INSERT OR IGNORE INTO exam_marks (exam_id, student_id, subject_id, written_marks, mcq_marks, practical_marks, total_marks, grade, grade_point, remarks, entered_by)
          VALUES (1, 1, ?, 65, 27, 0, 92, 'A+', 5.0, 'Outstanding comprehension and handwriting', 3)`, [bng7]);
  db.run(`INSERT OR IGNORE INTO exam_marks (exam_id, student_id, subject_id, written_marks, mcq_marks, practical_marks, total_marks, grade, grade_point, remarks, entered_by)
          VALUES (1, 1, ?, 62, 26, 0, 88, 'A+', 5.0, 'Excellent English grammar and writing skills', 3)`, [eng7]);
  db.run(`INSERT OR IGNORE INTO exam_marks (exam_id, student_id, subject_id, written_marks, mcq_marks, practical_marks, total_marks, grade, grade_point, remarks, entered_by)
          VALUES (1, 1, ?, 70, 25, 0, 95, 'A+', 5.0, 'Mastery in algebra and arithmetic problems', 3)`, [math7]);
  db.run(`INSERT OR IGNORE INTO exam_marks (exam_id, student_id, subject_id, written_marks, mcq_marks, practical_marks, total_marks, grade, grade_point, remarks, entered_by)
          VALUES (1, 1, ?, 58, 25, 0, 83, 'A+', 5.0, 'Very good analytical science answers', 4)`, [sci7]);
  db.run(`INSERT OR IGNORE INTO exam_marks (exam_id, student_id, subject_id, written_marks, mcq_marks, practical_marks, total_marks, grade, grade_point, remarks, entered_by)
          VALUES (1, 1, ?, 68, 28, 0, 96, 'A+', 5.0, 'Exemplary moral and religious knowledge', 3)`, [isl7]);

  // 10. Notices
  db.run(`INSERT OR IGNORE INTO notices (id, title, description, category, target_audience, priority, is_pinned, publish_date, status, created_by)
          VALUES (1, '২০২৬ শিক্ষাবর্ষে প্লে হতে ৯ম শ্রেণিতে নতুন শিক্ষার্থী ভর্তি চলছে', 'মোমেনা খাতুন মডেল একাডেমিতে সকল শ্রেণিতে সীমিত আসনে ভর্তি কার্যক্রম অব্যাহত রয়েছে। অফিস চলাকালীন সময়ে সরাসরি বা অনলাইনে ফরম সংগ্রহ করুন।', 'ADMISSION', 'EVERYONE', 'HIGH', 1, '2026-09-29', 'PUBLISHED', 1)`);

  db.run(`INSERT OR IGNORE INTO notices (id, title, description, category, target_audience, priority, is_pinned, publish_date, status, created_by)
          VALUES (2, 'মডেল টেস্ট পরীক্ষা ও প্রস্তুতি সংক্রান্ত নির্দেশনা', 'আসন্ন সাময়িক ও মডেল টেস্ট পরীক্ষার সিলেবাস শিক্ষার্থীদের মাঝে বিতরণ করা হয়েছে। যথাসময়ে সকল বিষয় রিভিশন সম্পন্ন করার নির্দেশ দেওয়া হচ্ছে।', 'EXAMINATION', 'STUDENTS', 'NORMAL', 1, '2026-09-25', 'PUBLISHED', 2)`);

  db.run(`INSERT OR IGNORE INTO notices (id, title, description, category, target_audience, priority, is_pinned, publish_date, status, created_by)
          VALUES (3, 'অভিভাবক-শিক্ষক মাসিক পরামর্শ সভা', 'শিক্ষার্থীদের পড়াশোনার অগ্রগতি ও নিয়মিত উপস্থিতি পর্যালোচনা করতে আগামী শুক্রবার সকাল ১০টায় অভিভাবক সমাবেশ অনুষ্ঠিত হবে।', 'GENERAL', 'GUARDIANS', 'NORMAL', 0, '2026-09-20', 'PUBLISHED', 2)`);

  // 11. Class Routines
  db.run(`INSERT OR IGNORE INTO class_routines (class_id, section_id, day, period_number, start_time, end_time, subject_id, teacher_id, room_no)
          VALUES (10, ?, 'SATURDAY', 1, '09:00 AM', '09:45 AM', ?, 1, 'Room 201')`, [secClass7A, math7]);
  db.run(`INSERT OR IGNORE INTO class_routines (class_id, section_id, day, period_number, start_time, end_time, subject_id, teacher_id, room_no)
          VALUES (10, ?, 'SATURDAY', 2, '09:45 AM', '10:30 AM', ?, 2, 'Room 201')`, [secClass7A, sci7]);
  db.run(`INSERT OR IGNORE INTO class_routines (class_id, section_id, day, period_number, start_time, end_time, subject_id, teacher_id, room_no)
          VALUES (10, ?, 'SUNDAY', 1, '09:00 AM', '09:45 AM', ?, 1, 'Room 201')`, [secClass7A, math7]);

  // 12. Homework
  db.run(`INSERT OR IGNORE INTO homeworks (id, teacher_id, class_id, section_id, subject_id, title, description, due_date)
          VALUES (1, 1, 10, ?, ?, 'গণিত অনুশীলনী ২.৩ এর ১-১০ পর্যন্ত সমাধান', 'বইয়ের সৃজনশীল প্রশ্ন ও বাস্তব সমস্যার সমাধান খাতায় করে আনবে।', '2026-10-05')`, [secClass7A, math7]);

  db.run(`INSERT OR IGNORE INTO homework_submissions (homework_id, student_id, submission_text, status, teacher_feedback)
          VALUES (1, 1, 'স্যার, সবগুলো অঙ্ক সম্পন্ন করে খাতায় করেছি।', 'REVIEWED', 'খুব চমৎকার হয়েছে। ১০/১০')`);

  // 13. Notifications
  db.run(`INSERT OR IGNORE INTO notifications (user_id, title, message, type, is_read)
          VALUES (6, 'নতুন নোটিশ প্রকাশিত হয়েছে', '২০২৬ শিক্ষাবর্ষের মডেল টেস্ট পরীক্ষার নোটিশ প্রকাশিত হয়েছে।', 'NOTICE', 0)`);
  db.run(`INSERT OR IGNORE INTO notifications (user_id, title, message, type, is_read)
          VALUES (5, 'ফলাফল প্রকাশিত হয়েছে', 'আপনার সন্তান আব্দুল্লাহ আল মামুনের ১ম পর্বের ফলাফল প্রকাশিত হয়েছে। জিপিএ: ৫.০০', 'RESULT', 0)`);

  console.log('✅ Database Seeding Completed Successfully!');
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
