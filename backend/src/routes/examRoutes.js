const express = require('express');
const auth = require('../middleware/auth');
const mentorController = require('../controllers/mentorController');

const router = express.Router();
const allowedRoles = ['student', 'staff', 'admin'];

router.post('/chat', auth(allowedRoles), mentorController.chatWithMentor);

module.exports = router;
