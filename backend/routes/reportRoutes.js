const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/attendance', requireAuth, reportController.getAttendanceReport);
router.get('/exam', requireAuth, reportController.getExaminationReport);

module.exports = router;
