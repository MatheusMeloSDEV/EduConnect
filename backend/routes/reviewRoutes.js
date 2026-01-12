const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

router.get('/article/:id', optionalAuth, reviewController.getReviewsByArticle);
router.post('/', authenticateToken, reviewController.createReview);
router.put('/:id/like', authenticateToken, reviewController.toggleReviewLike);
router.delete('/:id', authenticateToken, reviewController.deleteReview);

module.exports = router;