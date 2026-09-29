const bcrypt = require('bcryptjs');
const db = require('../config/db');

function getStudents(req, res) {
  try {
    const { class_id, section_id, search, status } = req.query;

    let sql = `
      SELECT s.*, 
        u.username, u.full_name, u.full_name_bn, u.email, u.phone, u.avatar,
        c.name as class_name, c.name_bn as class_name_bn,
        sec.name as section_name,
        g.occupation as guardian_occupation,
        gu.full_name as guardian_name, gu.phone as guardian_phone
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      LEFT JOIN sections sec ON s.section_id = sec.id
      LEFT JOIN guardians g ON s.guardian_id = g.id
      LEFT JOIN users gu ON g.user_id = gu.id
      WHERE 1=1
    `;
    const params = [];

    if (class_id) {
      sql += ' AND s.class_id = ?';
      params.push(class_id);
    }
    if (section_id) {
      sql += ' AND s.section_id = ?';
      params.push(section_id);
    }
    if (status) {
      sql += ' AND s.status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (u.full_name LIKE ? OR s.student_id_code LIKE ? OR s.father_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY c.numeric_level ASC, s.roll_no ASC';

    const students = db.all(sql, params);
    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch students', error: err.message });
  }
}

function getStudentById(req, res) {
  try {
    const { id } = req.params;

    const student = db.get(`
      SELECT s.*, 
        u.username, u.full_name, u.full_name_bn, u.email, u.phone, u.avatar,
        c.name as class_name, c.name_bn as class_name_bn,
        sec.name as section_name,
        g.occupation as guardian_occupation, g.nid as guardian_nid,
        gu.full_name as guardian_name, gu.phone as guardian_phone
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      LEFT JOIN sections sec ON s.section_id = sec.id
      LEFT JOIN guardians g ON s.guardian_id = g.id
      LEFT JOIN users gu ON g.user_id = gu.id
      WHERE s.id = ? OR s.user_id = ?
    `, [id, id]);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Fetch recent attendance stats
    const attendanceStats = db.get(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN status = 'ABSENT' THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN status = 'LATE' THEN 1 ELSE 0 END) as late_count,
        SUM(CASE WHEN status = 'LEAVE' THEN 1 ELSE 0 END) as leave_count
      FROM attendances
      WHERE student_id = ?
    `, [student.id]);

    // Fetch exam results
    const results = db.all(`
      SELECT em.*, e.name as exam_name, sub.name as subject_name, sub.code as subject_code
      FROM exam_marks em
      JOIN exams e ON em.exam_id = e.id
      JOIN subjects sub ON em.subject_id = sub.id
      WHERE em.student_id = ?
      ORDER BY em.exam_id DESC
    `, [student.id]);

    res.json({
      success: true,
      data: {
        ...student,
        attendanceStats,
        results
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch student profile', error: err.message });
  }
}

async function createStudent(req, res) {
  try {
    const {
      full_name, full_name_bn, username, password, email, phone,
      class_id, section_id, roll_no, father_name, mother_name,
      dob, gender, blood_group, address, guardian_id
    } = req.body;

    const userLogin = username || `student.${Date.now().toString().slice(-4)}`;
    const userPass = password || 'Student@123';
    const passHash = await bcrypt.hash(userPass, 10);

    const studentResult = db.transaction(() => {
      // 1. Create User
      const userRes = db.run(`
        INSERT INTO users (username, password_hash, role, full_name, full_name_bn, email, phone)
        VALUES (?, ?, 'STUDENT', ?, ?, ?, ?)
      `, [userLogin, passHash, full_name, full_name_bn || full_name, email || null, phone || null]);

      const userId = userRes.lastInsertRowid;
      const classObj = db.get('SELECT code FROM classes WHERE id = ?', [class_id]);
      const classCode = classObj ? classObj.code : 'CLS';
      const studentCode = `MKMA-${new Date().getFullYear().toString().slice(-2)}${classCode}-${roll_no}`;

      // 2. Create Student Profile
      const studentRes = db.run(`
        INSERT INTO students (
          user_id, student_id_code, roll_no, class_id, section_id,
          guardian_id, father_name, mother_name, dob, gender, blood_group, address, admission_date
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_DATE)
      `, [
        userId, studentCode, Number(roll_no), Number(class_id), section_id ? Number(section_id) : null,
        guardian_id ? Number(guardian_id) : null, father_name || null, mother_name || null,
        dob || null, gender || 'MALE', blood_group || null, address || null
      ]);

      return { userId, studentId: studentRes.lastInsertRowid, studentCode };
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: studentResult
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to register student', error: err.message });
  }
}

function getGuardians(req, res) {
  try {
    const guardians = db.all(`
      SELECT g.*, u.full_name, u.email, u.phone,
        (SELECT COUNT(*) FROM students WHERE guardian_id = g.id) as children_count
      FROM guardians g
      JOIN users u ON g.user_id = u.id
      ORDER BY u.full_name ASC
    `);
    res.json({ success: true, data: guardians });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch guardians', error: err.message });
  }
}

function getGuardianChildren(req, res) {
  try {
    let guardianId = req.params.guardianId;

    if (!guardianId || guardianId === 'me') {
      const g = db.get('SELECT id FROM guardians WHERE user_id = ?', [req.user.id]);
      if (!g) {
        return res.status(404).json({ success: false, message: 'Guardian profile not found for this account' });
      }
      guardianId = g.id;
    }

    const children = db.all(`
      SELECT s.*, 
        u.full_name, u.full_name_bn, u.avatar,
        c.name as class_name, c.name_bn as class_name_bn,
        sec.name as section_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      LEFT JOIN sections sec ON s.section_id = sec.id
      WHERE s.guardian_id = ?
    `, [guardianId]);

    res.json({ success: true, data: children });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch guardian children', error: err.message });
  }
}

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  getGuardians,
  getGuardianChildren
};
