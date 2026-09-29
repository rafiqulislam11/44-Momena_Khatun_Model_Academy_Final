const db = require('../config/db');

function getDashboardData(req, res) {
  try {
    const role = req.user.role;
    const today = new Date().toISOString().split('T')[0];

    // 1. ADMIN & SUPER ADMIN DASHBOARD
    if (role === 'SUPER ADMIN' || role === 'ADMIN') {
      const totalStudents = db.get("SELECT COUNT(*) as count FROM students WHERE status = 'ACTIVE'")?.count || 0;
      const totalTeachers = db.get('SELECT COUNT(*) as count FROM teachers')?.count || 0;
      const totalGuardians = db.get('SELECT COUNT(*) as count FROM guardians')?.count || 0;
      const totalClasses = db.get('SELECT COUNT(*) as count FROM classes')?.count || 0;

      const todayAttendance = db.get(`
        SELECT 
          COUNT(*) as total_marked,
          SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as present,
          SUM(CASE WHEN status = 'ABSENT' THEN 1 ELSE 0 END) as absent,
          SUM(CASE WHEN status = 'LATE' THEN 1 ELSE 0 END) as late,
          SUM(CASE WHEN status = 'LEAVE' THEN 1 ELSE 0 END) as leave
        FROM attendances
        WHERE date = ?
      `, [today]) || { total_marked: 0, present: 0, absent: 0, late: 0, leave: 0 };

      const activeNotices = db.all("SELECT * FROM notices WHERE status = 'PUBLISHED' ORDER BY is_pinned DESC, publish_date DESC LIMIT 5");
      const upcomingExams = db.all("SELECT * FROM exams ORDER BY id DESC LIMIT 3");
      const recentActivities = db.all("SELECT al.*, u.username, u.full_name FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id ORDER BY al.created_at DESC LIMIT 8");

      // Class distribution for charts
      const classDistribution = db.all(`
        SELECT c.name, COUNT(s.id) as student_count
        FROM classes c
        LEFT JOIN students s ON c.id = s.class_id
        GROUP BY c.id
        ORDER BY c.numeric_level ASC
      `);

      return res.json({
        success: true,
        role: 'ADMIN',
        data: {
          metrics: {
            totalStudents,
            totalTeachers,
            totalGuardians,
            totalClasses,
            todayAttendance
          },
          activeNotices,
          upcomingExams,
          recentActivities,
          classDistribution
        }
      });
    }

    // 2. TEACHER DASHBOARD
    if (role === 'TEACHER') {
      const teacher = db.get('SELECT * FROM teachers WHERE user_id = ?', [req.user.id]);
      const teacherId = teacher ? teacher.id : 0;

      const assignments = db.all(`
        SELECT ta.*, c.name as class_name, sec.name as section_name, sub.name as subject_name
        FROM teacher_assignments ta
        JOIN classes c ON ta.class_id = c.id
        JOIN sections sec ON ta.section_id = sec.id
        JOIN subjects sub ON ta.subject_id = sub.id
        WHERE ta.teacher_id = ?
      `, [teacherId]);

      const myHomework = db.all(`
        SELECT h.*, c.name as class_name, sub.name as subject_name,
          (SELECT COUNT(*) FROM homework_submissions WHERE homework_id = h.id) as submission_count
        FROM homeworks h
        JOIN classes c ON h.class_id = c.id
        JOIN subjects sub ON h.subject_id = sub.id
        WHERE h.teacher_id = ?
        ORDER BY h.due_date DESC LIMIT 5
      `, [teacherId]);

      const notices = db.all("SELECT * FROM notices WHERE status = 'PUBLISHED' ORDER BY publish_date DESC LIMIT 4");

      return res.json({
        success: true,
        role: 'TEACHER',
        data: {
          teacher,
          assignments,
          myHomework,
          notices
        }
      });
    }

    // 3. STUDENT DASHBOARD
    if (role === 'STUDENT') {
      const student = db.get(`
        SELECT s.*, c.name as class_name, c.name_bn as class_name_bn, sec.name as section_name
        FROM students s
        JOIN classes c ON s.class_id = c.id
        LEFT JOIN sections sec ON s.section_id = sec.id
        WHERE s.user_id = ?
      `, [req.user.id]);

      const studentId = student ? student.id : 0;

      const attendanceSummary = db.get(`
        SELECT 
          COUNT(*) as total_days,
          SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as present,
          SUM(CASE WHEN status = 'ABSENT' THEN 1 ELSE 0 END) as absent,
          SUM(CASE WHEN status = 'LATE' THEN 1 ELSE 0 END) as late,
          SUM(CASE WHEN status = 'LEAVE' THEN 1 ELSE 0 END) as leave
        FROM attendances
        WHERE student_id = ?
      `, [studentId]) || {};

      attendanceSummary.rate = attendanceSummary.total_days > 0
        ? Math.round(((attendanceSummary.present + attendanceSummary.late) / attendanceSummary.total_days) * 100)
        : 100;

      const latestResults = db.all(`
        SELECT em.*, sub.name as subject_name, sub.code as subject_code, e.name as exam_name
        FROM exam_marks em
        JOIN subjects sub ON em.subject_id = sub.id
        JOIN exams e ON em.exam_id = e.id
        WHERE em.student_id = ?
        ORDER BY em.exam_id DESC LIMIT 6
      `, [studentId]);

      const pendingHomework = db.all(`
        SELECT h.*, sub.name as subject_name, u.full_name as teacher_name,
          hs.status as submission_status
        FROM homeworks h
        JOIN subjects sub ON h.subject_id = sub.id
        JOIN teachers t ON h.teacher_id = t.id
        JOIN users u ON t.user_id = u.id
        LEFT JOIN homework_submissions hs ON h.id = hs.homework_id AND hs.student_id = ?
        WHERE h.class_id = ?
        ORDER BY h.due_date DESC LIMIT 5
      `, [studentId, student ? student.class_id : 0]);

      const notices = db.all("SELECT * FROM notices WHERE status = 'PUBLISHED' ORDER BY publish_date DESC LIMIT 5");

      return res.json({
        success: true,
        role: 'STUDENT',
        data: {
          student,
          attendanceSummary,
          latestResults,
          pendingHomework,
          notices
        }
      });
    }

    // 4. GUARDIAN DASHBOARD
    if (role === 'GUARDIAN') {
      const guardian = db.get('SELECT * FROM guardians WHERE user_id = ?', [req.user.id]);
      const guardianId = guardian ? guardian.id : 0;

      const children = db.all(`
        SELECT s.*, u.full_name as student_name, u.full_name_bn as student_name_bn,
          c.name as class_name, sec.name as section_name
        FROM students s
        JOIN users u ON s.user_id = u.id
        JOIN classes c ON s.class_id = c.id
        LEFT JOIN sections sec ON s.section_id = sec.id
        WHERE s.guardian_id = ?
      `, [guardianId]);

      const notices = db.all("SELECT * FROM notices WHERE status = 'PUBLISHED' ORDER BY publish_date DESC LIMIT 5");

      return res.json({
        success: true,
        role: 'GUARDIAN',
        data: {
          guardian,
          children,
          notices
        }
      });
    }

    res.status(400).json({ success: false, message: 'Unknown user role' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard data', error: err.message });
  }
}

module.exports = {
  getDashboardData
};
