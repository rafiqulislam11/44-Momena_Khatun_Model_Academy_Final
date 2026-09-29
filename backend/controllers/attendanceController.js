const db = require('../config/db');

function getClassAttendance(req, res) {
  try {
    const { class_id, section_id, date } = req.query;

    if (!class_id || !date) {
      return res.status(400).json({ success: false, message: 'class_id and date are required' });
    }

    let sql = `
      SELECT 
        s.id as student_id, s.student_id_code, s.roll_no,
        u.full_name as student_name, u.full_name_bn as student_name_bn,
        COALESCE(a.status, 'NOT_MARKED') as status,
        a.remarks, a.id as attendance_id
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN attendances a ON s.id = a.student_id AND a.date = ?
      WHERE s.class_id = ?
    `;
    const params = [date, class_id];

    if (section_id) {
      sql += ' AND s.section_id = ?';
      params.push(section_id);
    }

    sql += ' ORDER BY s.roll_no ASC';

    const students = db.all(sql, params);

    // Summary calculation
    const summary = {
      total: students.length,
      present: students.filter(s => s.status === 'PRESENT').length,
      absent: students.filter(s => s.status === 'ABSENT').length,
      late: students.filter(s => s.status === 'LATE').length,
      leave: students.filter(s => s.status === 'LEAVE').length,
      not_marked: students.filter(s => s.status === 'NOT_MARKED').length
    };
    summary.percentage = summary.total > 0 && summary.total !== summary.not_marked
      ? Math.round(((summary.present + summary.late) / (summary.total - summary.leave || 1)) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        date,
        summary,
        students
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch class attendance', error: err.message });
  }
}

function markAttendance(req, res) {
  try {
    const { class_id, section_id, date, records } = req.body;

    if (!class_id || !date || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'class_id, date, and records array are required' });
    }

    db.transaction(() => {
      for (const rec of records) {
        db.run(`
          INSERT INTO attendances (student_id, class_id, section_id, date, status, remarks, marked_by, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(student_id, date) DO UPDATE SET
            status = excluded.status,
            remarks = excluded.remarks,
            marked_by = excluded.marked_by,
            updated_at = CURRENT_TIMESTAMP
        `, [
          rec.student_id, class_id, section_id || null, date,
          rec.status || 'PRESENT', rec.remarks || null, req.user.id
        ]);
      }
    });

    res.json({
      success: true,
      message: `Attendance marked successfully for ${records.length} students`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save attendance', error: err.message });
  }
}

function markAllPresent(req, res) {
  try {
    const { class_id, section_id, date } = req.body;

    if (!class_id || !date) {
      return res.status(400).json({ success: false, message: 'class_id and date are required' });
    }

    let sql = 'SELECT id, section_id FROM students WHERE class_id = ?';
    const params = [class_id];
    if (section_id) {
      sql += ' AND section_id = ?';
      params.push(section_id);
    }
    const students = db.all(sql, params);

    db.transaction(() => {
      for (const s of students) {
        db.run(`
          INSERT INTO attendances (student_id, class_id, section_id, date, status, marked_by, updated_at)
          VALUES (?, ?, ?, ?, 'PRESENT', ?, CURRENT_TIMESTAMP)
          ON CONFLICT(student_id, date) DO UPDATE SET
            status = 'PRESENT',
            marked_by = excluded.marked_by,
            updated_at = CURRENT_TIMESTAMP
        `, [s.id, class_id, s.section_id, date, req.user.id]);
      }
    });

    res.json({
      success: true,
      message: `All ${students.length} students marked present for ${date}`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to mark all present', error: err.message });
  }
}

function getStudentAttendance(req, res) {
  try {
    const student_id = req.params.studentId;
    const { month, year } = req.query;

    let sql = `
      SELECT a.*, c.name as class_name, sec.name as section_name
      FROM attendances a
      JOIN classes c ON a.class_id = c.id
      LEFT JOIN sections sec ON a.section_id = sec.id
      WHERE a.student_id = ?
    `;
    const params = [student_id];

    if (year && month) {
      const monthPadded = String(month).padStart(2, '0');
      sql += ` AND strftime('%Y-%m', a.date) = ?`;
      params.push(`${year}-${monthPadded}`);
    } else if (year) {
      sql += ` AND strftime('%Y', a.date) = ?`;
      params.push(String(year));
    }

    sql += ' ORDER BY a.date DESC';

    const records = db.all(sql, params);

    const stats = {
      total: records.length,
      present: records.filter(r => r.status === 'PRESENT').length,
      absent: records.filter(r => r.status === 'ABSENT').length,
      late: records.filter(r => r.status === 'LATE').length,
      leave: records.filter(r => r.status === 'LEAVE').length
    };
    stats.percentage = stats.total > 0
      ? Math.round(((stats.present + stats.late) / stats.total) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        stats,
        records
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch student attendance', error: err.message });
  }
}

module.exports = {
  getClassAttendance,
  markAttendance,
  markAllPresent,
  getStudentAttendance
};
