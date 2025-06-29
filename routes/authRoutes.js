const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

// POST /api/auth/request-otp
router.post('/request-otp', authController.sendOtp);

// POST api/auth/request-wa-otp
router.post('/request-wa-otp', authController.sendWhatsAppOTP);

// POST /api/auth/verify-otp
router.post('/verify-otp', authController.verifyOtp);

//POST api/auth/login
router.post('/login', authController.loginUser);

//POST api/auth/me
router.get('/me', authController.getMe);

// POST /api/auth/logout
router.post('/logout', authController.logout);

module.exports = router;