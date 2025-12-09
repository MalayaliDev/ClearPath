const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const groqController = require('../controllers/groqController');

const router = express.Router();
const allowedRoles = ['student', 'staff', 'admin'];

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
    }
  },
});

// Jarvis chat endpoint
router.post('/jarvis', auth(allowedRoles), groqController.chatWithJarvis);

// File analysis endpoint
router.post('/analyze', auth(allowedRoles), upload.single('file'), groqController.analyzeFile);

module.exports = router;
