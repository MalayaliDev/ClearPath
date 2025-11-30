const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/pdfUpload');
const pdfController = require('../controllers/pdfController');

const router = express.Router();

router.post('/upload', auth(['student']), upload.single('file'), pdfController.uploadPdf);
router.post('/analyze', auth(['student']), pdfController.analyzePdf);
router.post('/ask', auth(['student']), pdfController.askPdf);
router.get('/uploads/recent', auth(['student']), pdfController.listRecentUploads);
router.delete('/upload/:fileId', auth(['student']), pdfController.deleteUpload);
router.get('/chats', auth(['student']), pdfController.listChats);
router.get('/chat/:chatId', auth(['student']), pdfController.getChatById);
router.delete('/chat/:chatId', auth(['student']), pdfController.deleteChat);
router.post('/chat', auth(['student']), pdfController.createChat);
router.get('/:fileId', auth(['student']), pdfController.getPdfMetadata);

module.exports = router;
