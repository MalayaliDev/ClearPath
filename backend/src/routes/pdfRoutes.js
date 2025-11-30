const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/pdfUpload');
const pdfController = require('../controllers/pdfController');

const router = express.Router();
const managedRoles = ['student', 'staff', 'admin'];

// Admin routes FIRST (more specific)
router.get('/admin/uploads', auth(['staff', 'admin']), pdfController.listAllUploads);
router.delete('/admin/upload/:fileId', auth(['staff', 'admin']), pdfController.adminDeleteUpload);

// Then other routes
router.post('/upload', auth(managedRoles), upload.single('file'), pdfController.uploadPdf);
router.post('/analyze', auth(managedRoles), pdfController.analyzePdf);
router.post('/ask', auth(managedRoles), pdfController.askPdf);
router.get('/uploads/recent', auth(managedRoles), pdfController.listRecentUploads);
router.delete('/upload/:fileId', auth(managedRoles), pdfController.deleteUpload);
router.get('/chats', auth(managedRoles), pdfController.listChats);
router.get('/chat/:chatId', auth(managedRoles), pdfController.getChatById);
router.delete('/chat/:chatId', auth(managedRoles), pdfController.deleteChat);
router.post('/chat', auth(managedRoles), pdfController.createChat);

// Catch-all for file metadata (least specific)
router.get('/:fileId', auth(managedRoles), pdfController.getPdfMetadata);

module.exports = router;
