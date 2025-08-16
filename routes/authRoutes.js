const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

// Twillio
// POST /api/auth/request-otp
router.post('/request-otp', authController.sendOtp);

// Twillio
// POST /api/auth/verify-otp
router.post('/verify-otp', authController.verifyOtp);

// MSG91

// Regular Calls

// POST api/auth/mrequest-otp
router.post('/mrequest-otp', authController.GenerateAndSendWhatsAppOTPMSG);

// POST api/auth/verify-otp
router.post('/mverify-otp', authController.VerifyOTPWhatsAppMSG);

// Login related calls
// POST Requesting for OTP for login
router.post('/mrequest-otp-login', authController.validateSendOTPForLogin);

// POST validate and login
router.post('/mverify-login', authController.validateAndLogin);


//POST api/auth/login
router.post('/login', authController.loginUser);

// POST api/auth/verifylogin
router.post('/verifylogin', authController.loginUserWithVerify)

//POST api/auth/me
router.get('/me', authController.getMe);

// POST /api/auth/logout
router.post('/logout', authController.logout);

module.exports = router;