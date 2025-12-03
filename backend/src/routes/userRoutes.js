const express = require('express');
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

// Admin endpoints - allow all authenticated users for now
router.get('/all', auth(), userController.getAllUsers);
router.post('/delete-multiple', auth(), userController.deleteMultipleUsers);
router.post('/update-role', auth(), userController.updateUserRole);
router.post('/toggle-flag', auth(), userController.toggleFlag);

// User endpoints
router.get('/phone', auth(['student', 'staff', 'admin']), userController.getPhoneNumber);
router.post('/phone', auth(['student', 'staff', 'admin']), userController.savePhoneNumber);
router.get('/webhook', auth(['student', 'staff', 'admin']), userController.getDiscordWebhook);
router.post('/webhook', auth(['student', 'staff', 'admin']), userController.saveDiscordWebhook);

module.exports = router;
