const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/class', requireAuth, attendanceController.getClassAttendance);
router.post('/mark', requireAuth, requireRole('SUPER ADMIN', 'ADMIN', 'TEACHER'), attendanceController.markAttendance);
router.post('/mark-all-present', requireAuth, requireRole('SUPER ADMIN', 'ADMIN', 'TEACHER'), attendanceController.markAllPresent);
router.get('/student/:studentId', requireAuth, attendanceController.getStudentAttendance);

module.exports = router;
