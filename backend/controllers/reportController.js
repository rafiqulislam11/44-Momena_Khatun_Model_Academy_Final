const db = require('../config/db');

function getAttendanceReport(req, res) {
  try {
    const { class_id, month, year, format } = req.query;

    if (!class_id) {
      return res.status(400).json({ success: false, message: 'class_id is required' });
    }

    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || (new Date().getMonth() + 1);
    const monthPadded = String(currentMonth).padStart(2, '0');
    const monthPattern = `${currentYear}-${monthPadded}`;

    const students = db.all(`
      SELECT s.id, s.student_id_code, s.roll_no, u.full_name as student_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.class_id = ?
      ORDER BY s.roll_no ASC
    `, [class_id]);

    const report = students.map(student => {
      const records = db.all(`
        SELECT date, status FROM attendances
        WHERE student_id = ? AND strftime('%Y-%m', date) = ?
        ORDER BY date ASC
      `, [student.id, monthPattern]);

      const totalDays = records.length;
      const present = records.filter(r => r.status === 'PRESENT').length;
      const absent = records.filter(r => r.status === 'ABSENT').length;
      const late = records.filter(r => r.status === 'LATE').length;
      const leave = records.filter(r => r.status === 'LEAVE').length;
      const percentage = totalDays > 0 ? Math.round(((present + late) / totalDays) * 100) : 0;

      return {
        ...student,
        totalDays,
        present,
        absent,
        late,
        leave,
        percentage,
        records
      };
    });

    if (format === 'csv') {
      let csv = 'Roll,Student ID,Name,Total Days,Present,Absent,Late,Leave,Percentage\n';
      report.forEach(r => {
        csv += `${r.roll_no},"${r.student_id_code}","${r.student_name}",${r.totalDays},${r.present},${r.absent},${r.late},${r.leave},${r.percentage}%\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=attendance_${class_id}_${monthPattern}.csv`);
      return res.send(csv);
    }

    res.json({
      success: true,
      data: {
        class_id,
        month: monthPattern,
        report
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to generate attendance report', error: err.message });
  }
}

function getExaminationReport(req, res) {
  try {
    const { exam_id, class_id } = req.query;

    if (!exam_id || !class_id) {
      return res.status(400).json({ success: false, message: 'exam_id and class_id are required' });
    }

    const exam = db.get('SELECT * FROM exams WHERE id = ?', [exam_id]);
    const classObj = db.get('SELECT * FROM classes WHERE id = ?', [class_id]);

    const stats = db.get(`
      SELECT 
        COUNT(DISTINCT student_id) as total_students,
        AVG(total_marks) as average_marks,
        MAX(total_marks) as highest_marks,
        MIN(total_marks) as lowest_marks
      FROM exam_marks
      WHERE exam_id = ?
    `, [exam_id]) || {};

    const gradeDistribution = db.all(`
      SELECT grade, COUNT(*) as count
      FROM exam_marks
      WHERE exam_id = ?
      GROUP BY grade
      ORDER BY grade ASC
    `, [exam_id]);

    res.json({
      success: true,
      data: {
        exam,
        class: classObj,
        stats: {
          totalStudents: stats.total_students || 0,
          averageMarks: Math.round(stats.average_marks || 0),
          highestMarks: stats.highest_marks || 0,
          lowestMarks: stats.lowest_marks || 0
        },
        gradeDistribution
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to generate exam report', error: err.message });
  }
}

module.exports = {
  getAttendanceReport,
  getExaminationReport
};
