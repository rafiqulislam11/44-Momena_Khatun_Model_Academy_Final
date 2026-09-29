const db = require('../config/db');

function getNotices(req, res) {
  try {
    const { category, target_audience, search, status } = req.query;

    let sql = `
      SELECT n.*, u.full_name as author_name, c.name as class_name
      FROM notices n
      LEFT JOIN users u ON n.created_by = u.id
      LEFT JOIN classes c ON n.target_class_id = c.id
      WHERE 1=1
    `;
    const params = [];

    // If unauthenticated or public request, only return PUBLISHED notices for EVERYONE
    if (!req.user) {
      sql += " AND n.status = 'PUBLISHED' AND n.target_audience = 'EVERYONE'";
    } else if (status) {
      sql += ' AND n.status = ?';
      params.push(status);
    } else {
      sql += " AND n.status != 'ARCHIVED'";
    }

    if (category && category !== 'all') {
      sql += ' AND n.category = ?';
      params.push(category.toUpperCase());
    }

    if (search) {
      sql += ' AND (n.title LIKE ? OR n.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY n.is_pinned DESC, n.publish_date DESC';

    const notices = db.all(sql, params);
    res.json({ success: true, data: notices });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch notices', error: err.message });
  }
}

function createNotice(req, res) {
  try {
    const {
      title, description, category, target_audience,
      target_class_id, priority, is_pinned, attachment_url, publish_date, expiry_date
    } = req.body;

    const result = db.run(`
      INSERT INTO notices (
        title, description, category, target_audience, target_class_id,
        priority, is_pinned, attachment_url, publish_date, expiry_date, status, created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED', ?)
    `, [
      title, description, category || 'GENERAL', target_audience || 'EVERYONE',
      target_class_id || null, priority || 'NORMAL', is_pinned ? 1 : 0,
      attachment_url || null, publish_date || new Date().toISOString().split('T')[0],
      expiry_date || null, req.user ? req.user.id : 1
    ]);

    res.status(201).json({
      success: true,
      message: 'Notice published successfully',
      data: { id: result.lastInsertRowid, title }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to publish notice', error: err.message });
  }
}

function deleteNotice(req, res) {
  try {
    const { id } = req.params;
    db.run('DELETE FROM notices WHERE id = ?', [id]);
    res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete notice', error: err.message });
  }
}

module.exports = {
  getNotices,
  createNotice,
  deleteNotice
};
