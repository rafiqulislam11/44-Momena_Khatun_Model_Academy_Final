const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const { requireAuth, requireRole } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const db = require('../config/db');

// Optional auth middleware so public visitors can fetch public notices while logged-in users see role-targeted notices
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.JWT_SECRET);
      req.user = db.get('SELECT id, username, role FROM users WHERE id = ?', [decoded.id]);
    } catch (e) {}
  }
  next();
}

router.get('/', optionalAuth, noticeController.getNotices);
router.post('/', requireAuth, requireRole('SUPER ADMIN', 'ADMIN'), noticeController.createNotice);
router.delete('/:id', requireAuth, requireRole('SUPER ADMIN', 'ADMIN'), noticeController.deleteNotice);

module.exports = router;
