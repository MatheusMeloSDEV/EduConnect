
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');

router.post('/suggestions', authenticateToken, aiController.generateSuggestions);
router.post('/analyze-doubts', authenticateToken, aiController.analyzeDoubts);

module.exports = router;
