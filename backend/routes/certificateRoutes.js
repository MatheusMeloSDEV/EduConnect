const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { authenticateToken } = require('../middleware/auth');

router.post('/:articleId/complete', authenticateToken, certificateController.markAsCompleted);
router.get('/:articleId/check', authenticateToken, certificateController.checkCompletion);
router.get('/user/my-certificates', authenticateToken, certificateController.getMyCertificates);

module.exports = router;