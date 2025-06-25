// // controllers/authController.js
// // This is a mock OTP-based controller (replace with Twilio or other services later)

// const User = require('../models/user');

// // Simulate sending OTP
// exports.sendOtp = async (req, res) => {
//   try {
//     const { phone } = req.body;
//     if (!phone) return res.status(400).json({ message: 'Phone is required' });

//     // Simulate sending OTP (mock or real SMS logic can go here)
//     console.log(`Sending OTP to ${phone}...`);
//     return res.status(200).json({ message: 'OTP sent successfully' });
//   } catch (err) {
//     console.error('Error sending OTP:', err);
//     res.status(500).json({ message: 'Failed to send OTP' });
//   }
// };

// // Simulate verifying OTP
// exports.verifyOtp = async (req, res) => {
//   try {
//     const { phone, otp } = req.body;
//     if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP are required' });

//     // Simulate OTP check (always accept for now)
//     console.log(`Verifying OTP ${otp} for ${phone}`);

//     // Find or create user (minimal)
//     const [user] = await User.findOrCreate({
//       where: { phone },
//       defaults: { name: 'User_' + phone.slice(-4) }
//     });

//     return res.status(200).json({ message: 'Login successful', user });
//   } catch (err) {
//     console.error('OTP verification failed:', err);
//     res.status(500).json({ message: 'OTP verification error' });
//   }
// };


// controllers/authController.js
// const User = require('../models/user');
// const twilio = require('twilio');
// require('dotenv').config();

// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// exports.sendOtp = async (req, res) => {
//   try {
//     const { phone } = req.body;
//     if (!phone) return res.status(400).json({ message: 'Phone is required' });

//     await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
//       .verifications
//       .create({ to: phone, channel: 'sms' });

//     return res.status(200).json({ message: 'OTP sent successfully' });
//   } catch (err) {
//     console.error('Error sending OTP:', err);
//     res.status(500).json({ message: 'Failed to send OTP' });
//   }
// };

// exports.verifyOtp = async (req, res) => {
//   try {
//     const { phone, otp } = req.body;
//     if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP are required' });

//     const verificationCheck = await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
//       .verificationChecks
//       .create({ to: phone, code: otp });

//     if (verificationCheck.status !== 'approved') {
//       return res.status(401).json({ message: 'Invalid or expired OTP' });
//     }

//     const [user] = await User.findOrCreate({
//       where: { phone },
//       defaults: { name: 'User_' + phone.slice(-4) }
//     });

//     return res.status(200).json({ message: 'Login successful', user });
//   } catch (err) {
//     console.error('OTP verification failed:', err);
//     res.status(500).json({ message: 'OTP verification error' });
//   }
// };


// ----------------------------
// WITH JWT TOKENS
// ----------------------------

// controllers/authController.js
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
require('dotenv').config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Sending OTP
exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone is required' });

    await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications
      .create({ to: phone, channel: 'sms' });

    return res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};


// Verifying OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP are required' });

    const verificationCheck = await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks
      .create({ to: phone, code: otp });

    if (verificationCheck.status !== 'approved') {
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    const [user] = await User.findOrCreate({
      where: { phone },
      defaults: { name: 'User_' + phone.slice(-4) }
    });

    const token = jwt.sign({ userId: user.id, phone: user.phone }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({ message: 'Login successful', user });
  } catch (err) {
    console.error('OTP verification failed:', err);
    res.status(500).json({ message: 'OTP verification error' });
  }
};


// Logout
exports.logout = async (req, res) => {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict'
    });
    res.status(200).json({ message: 'Logged out successfully' });
  };
