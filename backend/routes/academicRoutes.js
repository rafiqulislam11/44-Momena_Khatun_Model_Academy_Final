const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/years', academicController.getAcademicYears);
router.get('/classes', academicController.getClasses);
router.post('/classes', requireAuth, requireRole('SUPER ADMIN', 'ADMIN'), academicController.createClass);

router.get('/sections', academicController.getSections);
router.post('/sections', requireAuth, requireRole('SUPER ADMIN', 'ADMIN'), academicController.createSection);

router.get('/subjects', academicController.getSubjects);
router.post('/subjects', requireAuth, requireRole('SUPER ADMIN', 'ADMIN'), academicController.createSubject);

router.get('/assignments', requireAuth, academicController.getTeacherAssignments);

module.exports = router;
