const db = require('../config/db');

function getHomework(req, res) {
  try {
    const { class_id, section_id, teacher_id } = req.query;

    let sql = `
      SELECT h.*, 
        c.name as class_name, sec.name as section_name,
        sub.name as subject_name,
        u.full_name as teacher_name,
        (SELECT COUNT(*) FROM homework_submissions WHERE homework_id = h.id) as total_submissions
      FROM homeworks h
      JOIN classes c ON h.class_id = c.id
      JOIN sections sec ON h.section_id = sec.id
      JOIN subjects sub ON h.subject_id = sub.id
      JOIN teachers t ON h.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (class_id) {
      sql += ' AND h.class_id = ?';
      params.push(class_id);
    }
    if (section_id) {
      sql += ' AND h.section_id = ?';
      params.push(section_id);
    }
    if (teacher_id) {
      sql += ' AND h.teacher_id = ?';
      params.push(teacher_id);
    }

    sql += ' ORDER BY h.due_date DESC';

    const homeworks = db.all(sql, params);
    res.json({ success: true, data: homeworks });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch homework', error: err.message });
  }
}

function createHomework(req, res) {
  try {
    const { class_id, section_id, subject_id, title, description, due_date, attachment_url } = req.body;

    const teacher = db.get('SELECT id FROM teachers WHERE user_id = ?', [req.user.id]);
    const teacherId = teacher ? teacher.id : 1;

    const result = db.run(`
      INSERT INTO homeworks (teacher_id, class_id, section_id, subject_id, title, description, due_date, attachment_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [teacherId, class_id, section_id, subject_id, title, description, due_date, attachment_url || null]);

    res.status(201).json({
      success: true,
      message: 'Homework assigned successfully',
      data: { id: result.lastInsertRowid, title }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create homework', error: err.message });
  }
}

function submitHomework(req, res) {
  try {
    const { homework_id, student_id, submission_text, file_url } = req.body;

    const targetStudentId = student_id || (db.get('SELECT id FROM students WHERE user_id = ?', [req.user.id])?.id);

    if (!targetStudentId) {
      return res.status(400).json({ success: false, message: 'Student ID required' });
    }

    const homework = db.get('SELECT due_date FROM homeworks WHERE id = ?', [homework_id]);
    const isLate = homework && new Date() > new Date(homework.due_date);
    const status = isLate ? 'LATE' : 'SUBMITTED';

    db.run(`
      INSERT INTO homework_submissions (homework_id, student_id, submission_text, file_url, status)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(homework_id, student_id) DO UPDATE SET
        submission_text = excluded.submission_text,
        file_url = excluded.file_url,
        status = excluded.status,
        submitted_at = CURRENT_TIMESTAMP
    `, [homework_id, targetStudentId, submission_text || '', file_url || null, status]);

    res.json({
      success: true,
      message: 'Homework submitted successfully',
      status
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to submit homework', error: err.message });
  }
}

function getSubmissions(req, res) {
  try {
    const { homeworkId } = req.params;

    const submissions = db.all(`
      SELECT hs.*, 
        s.student_id_code, s.roll_no,
        u.full_name as student_name
      FROM homework_submissions hs
      JOIN students s ON hs.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE hs.homework_id = ?
      ORDER BY hs.submitted_at DESC
    `, [homeworkId]);

    res.json({ success: true, data: submissions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch submissions', error: err.message });
  }
}

module.exports = {
  getHomework,
  createHomework,
  submitHomework,
  getSubmissions
};
