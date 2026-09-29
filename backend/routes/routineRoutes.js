const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routineController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/class', routineController.getClassRoutines);
router.post('/class', requireAuth, requireRole('SUPER ADMIN', 'ADMIN'), routineController.saveClassRoutine);
router.get('/exam', routineController.getExamRoutines);

module.exports = router;
