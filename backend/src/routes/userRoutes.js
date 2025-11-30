const express = require('express');
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/phone', auth(['student', 'staff', 'admin']), userController.getPhoneNumber);
router.post('/phone', auth(['student', 'staff', 'admin']), userController.savePhoneNumber);
router.get('/webhook', auth(['student', 'staff', 'admin']), userController.getDiscordWebhook);
router.post('/webhook', auth(['student', 'staff', 'admin']), userController.saveDiscordWebhook);

module.exports = router;
