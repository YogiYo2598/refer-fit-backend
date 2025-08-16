// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

// Create or find user
router.post('/', userController.createUser);

// Get user by phone
router.get('/', userController.getUser);

// Update user by ID
router.put('/:id', userController.updateUser);

// Update Resume details
router.post('/resume/:id', userController.updateUserResumeDetails);

module.exports = router;
