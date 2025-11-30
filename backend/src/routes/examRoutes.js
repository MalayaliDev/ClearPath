const express = require('express');
const auth = require('../middleware/auth');
const examController = require('../controllers/examController');

const router = express.Router();

router.post('/generate', auth(['student']), examController.generateExam);
router.post('/submit', auth(['student']), examController.submitExam);
router.get('/session/:sessionId', auth(['student']), examController.getSession);
router.get('/history', auth(['student']), examController.listHistory);

module.exports = router;
