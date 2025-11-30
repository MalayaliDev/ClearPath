const express = require('express');
const auth = require('../middleware/auth');
const studyController = require('../controllers/studyController');

const router = express.Router();

router.post('/asset', auth(['student']), studyController.createAsset);
router.get('/assets', auth(['student']), studyController.listAssets);
router.post('/deck', auth(['student']), studyController.generateDeck);
router.get('/decks', auth(['student']), studyController.listDecks);
router.get('/deck/:deckId', auth(['student']), studyController.getDeck);
router.post('/deck/:deckId/submit', auth(['student']), studyController.submitDeck);

module.exports = router;
