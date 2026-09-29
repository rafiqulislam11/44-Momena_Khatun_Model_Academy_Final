const db = require('../config/db');

// Academic Years
function getAcademicYears(req, res) {
  try {
    const years = db.all('SELECT * FROM academic_years ORDER BY name DESC');
    res.json({ success: true, data: years });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch academic years', error: err.message });
  }
}

// Classes
function getClasses(req, res) {
  try {
    const classes = db.all(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM students WHERE class_id = c.id) as total_students,
        (SELECT COUNT(*) FROM subjects WHERE class_id = c.id) as total_subjects
      FROM classes c 
      ORDER BY c.numeric_level ASC
    `);

    // Attach sections to each class
    const sections = db.all('SELECT * FROM sections ORDER BY name ASC');
    const classesWithSections = classes.map(cls => ({
      ...cls,
      sections: sections.filter(s => s.class_id === cls.id)
    }));

    res.json({ success: true, data: classesWithSections });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch classes', error: err.message });
  }
}

function createClass(req, res) {
  try {
    const { name, name_bn, code, numeric_level } = req.body;
    const result = db.run(`
      INSERT INTO classes (name, name_bn, code, numeric_level)
      VALUES (?, ?, ?, ?)
    `, [name, name_bn, code, Number(numeric_level)]);

    const newClassId = result.lastInsertRowid;
    // Automatically create Section A for convenience
    db.run('INSERT INTO sections (class_id, name, room_no) VALUES (?, "A", "Room 101")', [newClassId]);

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: { id: newClassId, name, name_bn, code, numeric_level }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create class', error: err.message });
  }
}

// Sections
function getSections(req, res) {
  try {
    const { class_id } = req.query;
    let sql = 'SELECT s.*, c.name as class_name FROM sections s JOIN classes c ON s.class_id = c.id';
    const params = [];
    if (class_id) {
      sql += ' WHERE s.class_id = ?';
      params.push(class_id);
    }
    sql += ' ORDER BY s.name ASC';
    const sections = db.all(sql, params);
    res.json({ success: true, data: sections });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch sections', error: err.message });
  }
}

function createSection(req, res) {
  try {
    const { class_id, name, room_no, capacity } = req.body;
    const result = db.run(`
      INSERT INTO sections (class_id, name, room_no, capacity)
      VALUES (?, ?, ?, ?)
    `, [class_id, name, room_no || null, capacity || 40]);

    res.status(201).json({
      success: true,
      message: 'Section created successfully',
      data: { id: result.lastInsertRowid, class_id, name, room_no, capacity }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create section', error: err.message });
  }
}

// Subjects
function getSubjects(req, res) {
  try {
    const { class_id } = req.query;
    let sql = 'SELECT s.*, c.name as class_name FROM subjects s JOIN classes c ON s.class_id = c.id';
    const params = [];
    if (class_id) {
      sql += ' WHERE s.class_id = ?';
      params.push(class_id);
    }
    sql += ' ORDER BY s.id ASC';
    const subjects = db.all(sql, params);
    res.json({ success: true, data: subjects });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch subjects', error: err.message });
  }
}

function createSubject(req, res) {
  try {
    const { class_id, name, name_bn, code, full_marks, pass_marks } = req.body;
    const result = db.run(`
      INSERT INTO subjects (class_id, name, name_bn, code, full_marks, pass_marks)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [class_id, name, name_bn, code, full_marks || 100, pass_marks || 33]);

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: { id: result.lastInsertRowid, class_id, name, name_bn, code }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create subject', error: err.message });
  }
}

// Teacher Assignments
function getTeacherAssignments(req, res) {
  try {
    const assignments = db.all(`
      SELECT ta.*, 
        u.full_name as teacher_name, 
        t.designation,
        c.name as class_name, 
        sec.name as section_name, 
        sub.name as subject_name
      FROM teacher_assignments ta
      JOIN teachers t ON ta.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN classes c ON ta.class_id = c.id
      JOIN sections sec ON ta.section_id = sec.id
      JOIN subjects sub ON ta.subject_id = sub.id
      ORDER BY c.numeric_level ASC
    `);
    res.json({ success: true, data: assignments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch teacher assignments', error: err.message });
  }
}

module.exports = {
  getAcademicYears,
  getClasses,
  createClass,
  getSections,
  createSection,
  getSubjects,
  createSubject,
  getTeacherAssignments
};
