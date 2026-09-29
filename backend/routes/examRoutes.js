const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', examController.getExams);
router.post('/', requireAuth, requireRole('SUPER ADMIN', 'ADMIN'), examController.createExam);
router.post('/marks', requireAuth, requireRole('SUPER ADMIN', 'ADMIN', 'TEACHER'), examController.saveExamMarks);
router.get('/report-card/:studentId/:examId', requireAuth, examController.getStudentReportCard);
router.get('/class-sheet/:examId/:classId', requireAuth, examController.getClassResultSheet);

module.exports = router;
