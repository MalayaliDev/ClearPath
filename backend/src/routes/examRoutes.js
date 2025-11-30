const express = require('express');
const auth = require('../middleware/auth');
const examController = require('../controllers/examController');

const router = express.Router();
const allowedRoles = ['student', 'staff', 'admin'];

router.post('/generate', auth(allowedRoles), examController.generateExam);
router.post('/submit', auth(allowedRoles), examController.submitExam);
router.get('/session/:sessionId', auth(allowedRoles), examController.getSession);
router.get('/history', auth(allowedRoles), examController.listHistory);

module.exports = router;
