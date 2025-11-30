const express = require('express');
const auth = require('../middleware/auth');
const mentorController = require('../controllers/mentorController');

const router = express.Router();

router.post('/chat', auth(['student']), mentorController.chatWithMentor);

module.exports = router;
