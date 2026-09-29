const db = require('../config/db');

function calculateGradeAndPoint(totalMarks, fullMarks = 100) {
  const percentage = (totalMarks / fullMarks) * 100;
  if (percentage >= 80) return { grade: 'A+', gradePoint: 5.0 };
  if (percentage >= 70) return { grade: 'A', gradePoint: 4.0 };
  if (percentage >= 60) return { grade: 'A-', gradePoint: 3.5 };
  if (percentage >= 50) return { grade: 'B', gradePoint: 3.0 };
  if (percentage >= 40) return { grade: 'C', gradePoint: 2.0 };
  if (percentage >= 33) return { grade: 'D', gradePoint: 1.0 };
  return { grade: 'F', gradePoint: 0.0 };
}

function getExams(req, res) {
  try {
    const exams = db.all(`
      SELECT e.*, ay.name as academic_year_name,
        (SELECT COUNT(DISTINCT student_id) FROM exam_marks WHERE exam_id = e.id) as participants_count
      FROM exams e
      JOIN academic_years ay ON e.academic_year_id = ay.id
      ORDER BY e.id DESC
    `);
    res.json({ success: true, data: exams });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch exams', error: err.message });
  }
}

function createExam(req, res) {
  try {
    const { academic_year_id, name, exam_type, start_date, end_date, is_published } = req.body;
    const result = db.run(`
      INSERT INTO exams (academic_year_id, name, exam_type, start_date, end_date, is_published)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [academic_year_id || 1, name, exam_type || 'FIRST TERM', start_date || null, end_date || null, is_published ? 1 : 0]);

    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      data: { id: result.lastInsertRowid, name }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create exam', error: err.message });
  }
}

function saveExamMarks(req, res) {
  try {
    const { exam_id, student_id, subject_id, written_marks, mcq_marks, practical_marks, remarks } = req.body;

    const subject = db.get('SELECT full_marks, pass_marks FROM subjects WHERE id = ?', [subject_id]);
    const fullMarks = subject ? subject.full_marks : 100;

    const written = Number(written_marks || 0);
    const mcq = Number(mcq_marks || 0);
    const practical = Number(practical_marks || 0);
    const total = written + mcq + practical;

    const { grade, gradePoint } = calculateGradeAndPoint(total, fullMarks);

    db.run(`
      INSERT INTO exam_marks (
        exam_id, student_id, subject_id, written_marks, mcq_marks, practical_marks,
        total_marks, grade, grade_point, remarks, entered_by, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(exam_id, student_id, subject_id) DO UPDATE SET
        written_marks = excluded.written_marks,
        mcq_marks = excluded.mcq_marks,
        practical_marks = excluded.practical_marks,
        total_marks = excluded.total_marks,
        grade = excluded.grade,
        grade_point = excluded.grade_point,
        remarks = excluded.remarks,
        entered_by = excluded.entered_by,
        updated_at = CURRENT_TIMESTAMP
    `, [exam_id, student_id, subject_id, written, mcq, practical, total, grade, gradePoint, remarks || null, req.user.id]);

    res.json({
      success: true,
      message: 'Marks recorded successfully',
      data: { total, grade, gradePoint }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save marks', error: err.message });
  }
}

function getStudentReportCard(req, res) {
  try {
    const { studentId, examId } = req.params;

    const student = db.get(`
      SELECT s.*, u.full_name as student_name, u.full_name_bn as student_name_bn,
        c.name as class_name, c.name_bn as class_name_bn,
        sec.name as section_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      LEFT JOIN sections sec ON s.section_id = sec.id
      WHERE s.id = ? OR s.user_id = ?
    `, [studentId, studentId]);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const exam = db.get('SELECT * FROM exams WHERE id = ?', [examId]);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    const marks = db.all(`
      SELECT em.*, sub.name as subject_name, sub.name_bn as subject_name_bn, sub.code as subject_code, sub.full_marks, sub.pass_marks
      FROM exam_marks em
      JOIN subjects sub ON em.subject_id = sub.id
      WHERE em.exam_id = ? AND em.student_id = ?
      ORDER BY sub.id ASC
    `, [examId, student.id]);

    let grandTotal = 0;
    let maxGrandTotal = 0;
    let totalGradePoints = 0;
    let hasFailed = false;

    marks.forEach(m => {
      grandTotal += m.total_marks;
      maxGrandTotal += m.full_marks;
      totalGradePoints += m.grade_point;
      if (m.grade === 'F') hasFailed = true;
    });

    const subjectCount = marks.length;
    let gpa = subjectCount > 0 ? (totalGradePoints / subjectCount) : 0;
    if (hasFailed) gpa = 0.0;
    gpa = Number(gpa.toFixed(2));

    let finalGrade = 'F';
    if (!hasFailed) {
      if (gpa >= 5.0) finalGrade = 'A+';
      else if (gpa >= 4.0) finalGrade = 'A';
      else if (gpa >= 3.5) finalGrade = 'A-';
      else if (gpa >= 3.0) finalGrade = 'B';
      else if (gpa >= 2.0) finalGrade = 'C';
      else if (gpa >= 1.0) finalGrade = 'D';
    }

    res.json({
      success: true,
      data: {
        student,
        exam,
        marks,
        summary: {
          grandTotal,
          maxGrandTotal,
          gpa,
          finalGrade,
          status: hasFailed ? 'FAILED' : 'PASSED',
          percentage: maxGrandTotal > 0 ? Math.round((grandTotal / maxGrandTotal) * 100) : 0
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to generate report card', error: err.message });
  }
}

function getClassResultSheet(req, res) {
  try {
    const { examId, classId } = req.params;

    const students = db.all(`
      SELECT s.id, s.student_id_code, s.roll_no, u.full_name as student_name, sec.name as section_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN sections sec ON s.section_id = sec.id
      WHERE s.class_id = ?
      ORDER BY s.roll_no ASC
    `, [classId]);

    const results = students.map(student => {
      const marks = db.all(`
        SELECT em.*, sub.name as subject_name, sub.code as subject_code
        FROM exam_marks em
        JOIN subjects sub ON em.subject_id = sub.id
        WHERE em.exam_id = ? AND em.student_id = ?
      `, [examId, student.id]);

      let grandTotal = 0;
      let totalGP = 0;
      let hasFailed = false;

      marks.forEach(m => {
        grandTotal += m.total_marks;
        totalGP += m.grade_point;
        if (m.grade === 'F') hasFailed = true;
      });

      const count = marks.length;
      let gpa = count > 0 ? Number((totalGP / count).toFixed(2)) : 0;
      if (hasFailed) gpa = 0.0;

      return {
        ...student,
        marks,
        grandTotal,
        gpa,
        status: hasFailed ? 'FAILED' : (count > 0 ? 'PASSED' : 'ABSENT')
      };
    });

    // Sort by grandTotal descending to determine rank
    results.sort((a, b) => b.grandTotal - a.grandTotal);
    results.forEach((r, idx) => {
      r.rank = r.status === 'PASSED' ? idx + 1 : '-';
    });

    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch class result sheet', error: err.message });
  }
}

module.exports = {
  getExams,
  createExam,
  saveExamMarks,
  getStudentReportCard,
  getClassResultSheet
};
