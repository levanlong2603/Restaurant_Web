const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chabotController');

// Route for chat API endpoint
router.post('/chat', chatbotController.processChat);
// Diagnostic route to check LLM connectivity
router.get('/debug', chatbotController.testLLM);

module.exports = router;