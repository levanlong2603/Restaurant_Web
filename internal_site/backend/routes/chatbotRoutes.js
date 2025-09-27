const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chabotController');

// Route for chat API endpoint
router.post('/chat', chatbotController.processChat);

module.exports = router;