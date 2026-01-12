
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// Public
router.post('/register', userController.register);
router.post('/login', userController.login);

// Authenticated (Self)
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);
router.put('/password', authenticateToken, userController.changePassword);

// Admin (Management)
router.get('/', authenticateToken, userController.getAllUsers);
router.get('/:id', authenticateToken, userController.getUserById);
router.post('/', authenticateToken, userController.createUserByAdmin);
router.put('/:id', authenticateToken, userController.updateUserByAdmin);
router.delete('/:id', authenticateToken, userController.deleteUser);

module.exports = router;
