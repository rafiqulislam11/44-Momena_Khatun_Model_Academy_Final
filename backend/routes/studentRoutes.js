const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', requireAuth, studentController.getStudents);
router.get('/guardians', requireAuth, studentController.getGuardians);
router.get('/guardians/:guardianId/children', requireAuth, studentController.getGuardianChildren);
router.get('/:id', requireAuth, studentController.getStudentById);
router.post('/', requireAuth, requireRole('SUPER ADMIN', 'ADMIN'), studentController.createStudent);

module.exports = router;
