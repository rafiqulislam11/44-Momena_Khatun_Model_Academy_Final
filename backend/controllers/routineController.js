const db = require('../config/db');

function getClassRoutines(req, res) {
  try {
    const { class_id, section_id, teacher_id } = req.query;

    let sql = `
      SELECT cr.*, 
        c.name as class_name, c.name_bn as class_name_bn,
        sec.name as section_name,
        sub.name as subject_name, sub.code as subject_code,
        u.full_name as teacher_name
      FROM class_routines cr
      JOIN classes c ON cr.class_id = c.id
      JOIN sections sec ON cr.section_id = sec.id
      JOIN subjects sub ON cr.subject_id = sub.id
      LEFT JOIN teachers t ON cr.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (class_id) {
      sql += ' AND cr.class_id = ?';
      params.push(class_id);
    }
    if (section_id) {
      sql += ' AND cr.section_id = ?';
      params.push(section_id);
    }
    if (teacher_id) {
      sql += ' AND cr.teacher_id = ?';
      params.push(teacher_id);
    }

    sql += ' ORDER BY cr.day ASC, cr.period_number ASC';

    const routines = db.all(sql, params);
    res.json({ success: true, data: routines });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch class routines', error: err.message });
  }
}

function saveClassRoutine(req, res) {
  try {
    const { class_id, section_id, day, period_number, start_time, end_time, subject_id, teacher_id, room_no } = req.body;

    db.run(`
      INSERT INTO class_routines (
        class_id, section_id, day, period_number, start_time, end_time, subject_id, teacher_id, room_no
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(class_id, section_id, day, period_number) DO UPDATE SET
        start_time = excluded.start_time,
        end_time = excluded.end_time,
        subject_id = excluded.subject_id,
        teacher_id = excluded.teacher_id,
        room_no = excluded.room_no
    `, [class_id, section_id, day, period_number, start_time, end_time, subject_id, teacher_id || null, room_no || null]);

    res.json({ success: true, message: 'Class routine updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save class routine', error: err.message });
  }
}

function getExamRoutines(req, res) {
  try {
    const { exam_id, class_id } = req.query;

    let sql = `
      SELECT er.*, 
        e.name as exam_name,
        c.name as class_name,
        sub.name as subject_name, sub.code as subject_code
      FROM exam_routines er
      JOIN exams e ON er.exam_id = e.id
      JOIN classes c ON er.class_id = c.id
      JOIN subjects sub ON er.subject_id = sub.id
      WHERE 1=1
    `;
    const params = [];

    if (exam_id) {
      sql += ' AND er.exam_id = ?';
      params.push(exam_id);
    }
    if (class_id) {
      sql += ' AND er.class_id = ?';
      params.push(class_id);
    }

    sql += ' ORDER BY er.exam_date ASC, er.start_time ASC';

    const routines = db.all(sql, params);
    res.json({ success: true, data: routines });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch exam routines', error: err.message });
  }
}

module.exports = {
  getClassRoutines,
  saveClassRoutine,
  getExamRoutines
};
