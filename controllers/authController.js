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
const twilio = require('twilio');
const axios = require('axios');
require('dotenv').config();

// for secured authentication
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Sending OTP
exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone is required' });

    await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications
      .create({ to: phone, channel: 'whatsapp' });

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

    // const [user] = await User.findOrCreate({
    //   where: { phone },
    //   defaults: { name: 'User_' + phone.slice(-4) }
    // });

    const token = jwt.sign({ phone: phone }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({ message: 'OTP verification successful' });
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


exports.sendWhatsAppOTP = async (req, res) => {
  // const options = {
  //   method: 'POST',
  //   url: 'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     authkey: '456251A2oUatjmNQwM68600378P1'
  //   },
  //   data: {
  //     integrated_number: "15557926584",
  //     content_type: "template",
  //     payload: {
  //       messaging_product: "whatsapp",
  //       type: "template",
  //       template: {
  //         name: "referfitauth",
  //         language: {
  //           code: "en",
  //           policy: "deterministic"
  //         },
  //         namespace: "b3616038_2396_4ad3_a0d7_85cdf5ee7be8",
  //         to_and_components: [
  //           {
  //             to: [
  //               "917411917211" // <-- replace with actual phone numbers
  //             ],
  //             components: {
  //               body_1: {
  //                 type: "text",
  //                 value: "1998"
  //               },
  //               button_1: {
  //                 subtype: "url",
  //                 type: "text",
  //                 value: "1998"
  //               }
  //             }
  //           }
  //         ]
  //       }
  //     }
  //   }
  // };


  const options = {
    method: 'POST',
    url: 'https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/',
    params: { integrated_number: '15557926584', recipient_number: '917411917211', content_type: 'text', text: 'OTP is 1998 for refer.fit validation' },
    headers: {
      authkey: '456251A2oUatjmNQwM68600378P1',
      accept: 'application/json',
      'content-type': 'application/json'
    }
  };

  axios(options)
    .then(response => {
      console.log("✅ Success:", response.data);
      return res.status(200).json({ message: 'OTP sent successfully' });
    })
    .catch(error => {
      console.error("❌ Error:", error.response?.data || error.message);
      res.status(500).json({ message: 'Failed to send OTP' });
    });
};

// Login
exports.loginUser = async(req, res) => {
  const { phone } = req.body;

  const user = await User.findOne({
    where: { phone }
  });

  // If user does not exists
  if (!user) return res.status(401).json({ message: 'User does not exists/invalid credentials, Please register!' });

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, company: user.company }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'Lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });

  res.json({ message: 'Login successful' });

}

// GET /api/auth/me
exports.getMe = async(req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
