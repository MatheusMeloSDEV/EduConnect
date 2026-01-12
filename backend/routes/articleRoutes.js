const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, articleController.getAllArticles);
router.get('/popular', articleController.getPopularArticles);
router.get('/:id', optionalAuth, articleController.getArticleById);
router.post('/', authenticateToken, articleController.createArticle);
router.put('/:id', authenticateToken, articleController.updateArticle);
router.delete('/:id', authenticateToken, articleController.deleteArticle);
router.put('/:id/upvote', authenticateToken, articleController.toggleUpvote);

module.exports = router;