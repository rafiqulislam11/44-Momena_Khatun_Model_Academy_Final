const express = require('express');
const router = express.Router();
const homeworkController = require('../controllers/homeworkController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', requireAuth, homeworkController.getHomework);
router.post('/', requireAuth, requireRole('SUPER ADMIN', 'ADMIN', 'TEACHER'), homeworkController.createHomework);
router.post('/submit', requireAuth, homeworkController.submitHomework);
router.get('/:homeworkId/submissions', requireAuth, homeworkController.getSubmissions);

module.exports = router;
