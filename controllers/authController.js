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
const mysql = require("mysql2/promise");

// for secured authentication
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { generateOtp, genNonce, hashOtp, isE164 } = require("../utils/otp");
const { sendWhatsAppOtp } = require("../services/msg91");

// Required for OTP service
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "test",
  waitForConnections: true,
  connectionLimit: 10
});

const OTP_TTL_MIN = parseInt(process.env.OTP_TTL_MIN || "5", 10);
const OTP_DIGITS = parseInt(process.env.OTP_DIGITS || "4", 10);
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || "5", 10);
const APP_SECRET = process.env.APP_SECRET;

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Twillio
// Sending OTP
exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone is required' });

    const phoneRaw = phone.replace("+91", "")
    const user = await User.findOne({
      where: { phone: phoneRaw }
    });

    // If user does not exists
    if (!user) return res.status(401).json({ message: 'User does not exists/invalid credentials, Please register!' });


    await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications
      .create({ to: phone, channel: 'sms' });

    return res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};


// Twillio API
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

// MSG91 API - OLD DUMMY LOGIC

async function sendWhatsAppOtpMSG(req, res) {
  try {
    let { phone } = req.body;
    if (!phone) return res.status(400).json({ ok: false, error: "phone required" });

    phone = normalizePhone(phone);
    if (!isE164(phone)) return res.status(400).json({ ok: false, error: "invalid phone format" });

    const code = generateOtp(OTP_DIGITS);
    const nonce = genNonce();
    const codeHash = hashOtp(phone, code, nonce, APP_SECRET);
    const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);

    // upsert by phone
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        `INSERT INTO otp_codes (phone, code_hash, nonce, attempts, expires_at)
         VALUES (?, ?, ?, 0, ?)
         ON DUPLICATE KEY UPDATE code_hash=VALUES(code_hash), nonce=VALUES(nonce), attempts=0, expires_at=VALUES(expires_at)`,
        [phone, codeHash, nonce, expiresAt]
      );
    } finally {
      conn.release();
    }

    // Send over WhatsApp via MSG91
    await sendWhatsAppOtp({ to: phone.replace("+", ""), code });

    res.json({ ok: true, message: "OTP sent over WhatsApp", ttl_min: OTP_TTL_MIN });
  } catch (err) {
    console.error(err?.response?.data || err);
    res.status(500).json({ ok: false, error: "failed_to_send_otp" });
  }
}

// exports.sendWhatsAppOTP = async (req, res) => {
//   // const options = {
//   //   method: 'POST',
//   //   url: 'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/',
//   //   headers: {
//   //     'Content-Type': 'application/json',
//   //     authkey: '456251A2oUatjmNQwM68600378P1'
//   //   },
//   //   data: {
//   //     integrated_number: "15557926584",
//   //     content_type: "template",
//   //     payload: {
//   //       messaging_product: "whatsapp",
//   //       type: "template",
//   //       template: {
//   //         name: "referfitauth",
//   //         language: {
//   //           code: "en",
//   //           policy: "deterministic"
//   //         },
//   //         namespace: "b3616038_2396_4ad3_a0d7_85cdf5ee7be8",
//   //         to_and_components: [
//   //           {
//   //             to: [
//   //               "917411917211" // <-- replace with actual phone numbers
//   //             ],
//   //             components: {
//   //               body_1: {
//   //                 type: "text",
//   //                 value: "1998"
//   //               },
//   //               button_1: {
//   //                 subtype: "url",
//   //                 type: "text",
//   //                 value: "1998"
//   //               }
//   //             }
//   //           }
//   //         ]
//   //       }
//   //     }
//   //   }
//   // };


//   const options = {
//     method: 'POST',
//     url: 'https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/',
//     params: { integrated_number: '15557926584', recipient_number: '917411917211', content_type: 'text', text: 'OTP is 1998 for refer.fit validation' },
//     headers: {
//       authkey: '456251A2oUatjmNQwM68600378P1',
//       accept: 'application/json',
//       'content-type': 'application/json'
//     }
//   };

//   axios(options)
//     .then(response => {
//       console.log("✅ Success:", response.data);
//       return res.status(200).json({ message: 'OTP sent successfully' });
//     })
//     .catch(error => {
//       console.error("❌ Error:", error.response?.data || error.message);
//       res.status(500).json({ message: 'Failed to send OTP' });
//     });
// };

// Normalize to E.164-ish: prepend + if missing and Indian numbers begin 91, etc.
// Adjust to your onboarding rules:
function normalizePhone(p) {
  let phone = p.trim();
  if (!phone.startsWith("+")) {
    // Assume already with country code (like "91..."). If you need to force +, do it here:
    phone = `+${phone}`;
  }
  return phone;
}

// MSG91 API - Sending Normal
// exports.GenerateAndSendWhatsAppOTPMSG = sendWhatsAppOtpMSG;
exports.GenerateAndSendWhatsAppOTPMSG = async(req, res) => {
  try {
    let { phone } = req.body;
    if (!phone) return res.status(400).json({ ok: false, error: "phone required" });

    phone = normalizePhone(phone);
    if (!isE164(phone)) return res.status(400).json({ ok: false, error: "invalid phone format" });

    const code = generateOtp(OTP_DIGITS);
    const nonce = genNonce();
    const codeHash = hashOtp(phone, code, nonce, APP_SECRET);
    const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);

    // upsert by phone
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        `INSERT INTO otp_codes (phone, code_hash, nonce, attempts, expires_at)
         VALUES (?, ?, ?, 0, ?)
         ON DUPLICATE KEY UPDATE code_hash=VALUES(code_hash), nonce=VALUES(nonce), attempts=0, expires_at=VALUES(expires_at)`,
        [phone, codeHash, nonce, expiresAt]
      );
    } finally {
      conn.release();
    }

    // Send over WhatsApp via MSG91
    await sendWhatsAppOtp({ to: phone.replace("+", ""), code });

    res.json({ ok: true, message: "OTP sent over WhatsApp", ttl_min: OTP_TTL_MIN });
  } catch (err) {
    console.error(err?.response?.data || err);
    res.status(500).json({ ok: false, error: "failed_to_send_otp" });
  }
}

// MSG91 API - verification Normal

async function verifyOTPMSG(req, res) {
  try {
    let { phone, code } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ ok: false, error: "phone and code required" });
    }

    phone = normalizePhone(phone);
    if (!isE164(phone)) return res.status(400).json({ ok: false, error: "invalid phone format" });

    const conn = await pool.getConnection();
    let row;
    try {
      const [rows] = await conn.execute(
        "SELECT id, code_hash, nonce, attempts, expires_at FROM otp_codes WHERE phone=?",
        [phone]
      );
      row = rows[0];
      if (!row) {
        return res.status(400).json({ ok: false, error: "otp_not_found" });
      }
      if (row.attempts >= OTP_MAX_ATTEMPTS) {
        return res.status(429).json({ ok: false, error: "too_many_attempts" });
      }
      if (new Date(row.expires_at).getTime() < Date.now()) {
        return res.status(400).json({ ok: false, error: "otp_expired" });
      }

      const recomputed = hashOtp(phone, code, row.nonce, APP_SECRET);
      const match = cryptoSafeEqual(recomputed, row.code_hash);

      if (!match) {
        await conn.execute("UPDATE otp_codes SET attempts = attempts + 1 WHERE id=?", [row.id]);
        return res.status(400).json({ ok: false, error: "invalid_code" });
      }

      // success: delete the record
      await conn.execute("DELETE FROM otp_codes WHERE id=?", [row.id]);
    } finally {
      conn.release();
    }

    // TODO: create your session/JWT here
    return res.json({ ok: true, message: "otp_verified" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "verification_failed" });
  }
}

exports.VerifyOTPWhatsAppMSG = async(req, res) => {
  try {
    let { phone, code } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ ok: false, error: "phone and code required" });
    }

    phone = normalizePhone(phone);
    if (!isE164(phone)) return res.status(400).json({ ok: false, error: "invalid phone format" });

    const conn = await pool.getConnection();
    let row;
    try {
      const [rows] = await conn.execute(
        "SELECT id, code_hash, nonce, attempts, expires_at FROM otp_codes WHERE phone=?",
        [phone]
      );
      row = rows[0];
      if (!row) {
        return res.status(400).json({ ok: false, error: "otp_not_found" });
      }
      if (row.attempts >= OTP_MAX_ATTEMPTS) {
        return res.status(429).json({ ok: false, error: "too_many_attempts" });
      }
      if (new Date(row.expires_at).getTime() < Date.now()) {
        return res.status(400).json({ ok: false, error: "otp_expired" });
      }

      const recomputed = hashOtp(phone, code, row.nonce, APP_SECRET);
      const match = cryptoSafeEqual(recomputed, row.code_hash);

      if (!match) {
        await conn.execute("UPDATE otp_codes SET attempts = attempts + 1 WHERE id=?", [row.id]);
        return res.status(400).json({ ok: false, error: "invalid_code" });
      }

      // success: delete the record
      await conn.execute("DELETE FROM otp_codes WHERE id=?", [row.id]);
    } finally {
      conn.release();
    }

    // TODO: create your session/JWT here
    return res.json({ ok: true, message: "otp_verified" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "verification_failed" });
  }
};

// // constant-time compare
// function cryptoSafeEqual(a, b) {
//   const bufA = Buffer.from(a, "utf8");
//   const bufB = Buffer.from(b, "utf8");
//   if (bufA.length !== bufB.length) return false;
//   return crypto.timingSafeEqual(bufA, bufB);
// }

function cryptoSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) return false;

  let diff = 0;
  for (let i = 0; i < bufA.length; i++) {
    diff |= bufA[i] ^ bufB[i];
  }
  return diff === 0;
}

// Login with MSG91 Verification

// send OTP validating if number exists and then send OTP
exports.validateSendOTPForLogin = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone is required' });

    const phoneRaw = phone.replace("91", "")
    const user = await User.findOne({
      where: { phone: phoneRaw }
    });

    // If user does not exists
    if (!user) return res.status(401).json({ message: 'User does not exists/invalid credentials, Please register!' });

    const response = await sendWhatsAppOtpMSG(req, res);
    // console.log(response)
    return response;

  }  catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
}

// verify OTP and login for login user
exports.validateAndLogin = async(req, res) => {
  try {
    let { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP are required' });

    // validating logic starts from here
    phone = normalizePhone(phone);
    if (!isE164(phone)) return res.status(400).json({ ok: false, error: "invalid phone format" });

    const conn = await pool.getConnection();
    let row;
    try {
      const [rows] = await conn.execute(
        "SELECT id, code_hash, nonce, attempts, expires_at FROM otp_codes WHERE phone=?",
        [phone]
      );
      row = rows[0];
      if (!row) {
        return res.status(400).json({ ok: false, error: "otp_not_found" });
      }
      if (row.attempts >= OTP_MAX_ATTEMPTS) {
        return res.status(429).json({ ok: false, error: "too_many_attempts" });
      }
      if (new Date(row.expires_at).getTime() < Date.now()) {
        return res.status(400).json({ ok: false, error: "otp_expired" });
      }

      const recomputed = hashOtp(phone, otp, row.nonce, APP_SECRET);
      const match = cryptoSafeEqual(recomputed, row.code_hash);

      if (!match) {
        await conn.execute("UPDATE otp_codes SET attempts = attempts + 1 WHERE id=?", [row.id]);
        return res.status(400).json({ ok: false, error: "invalid_code" });
      }

      // success: delete the record
      await conn.execute("DELETE FROM otp_codes WHERE id=?", [row.id]);
    } finally {
      conn.release();
    }
    
    // validate logic ends here
    
    // if(!validate_response['ok']) {
    //   return res.status(400).json({ message: 'Invalid OTP Provided!' });
    // } 

    const phoneRaw = phone.replace("+91", "");

    // console.log(phoneRaw)
    const user = await User.findOne({
      where: { phone: phoneRaw }
    });
  
    // If user does not exists
    if (!user) return res.status(402).json({ message: 'User does not exists/invalid credentials, Please register!' });
  
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, company: user.company, resumeName: user.resumeName, resumeURL: user.resumeURL }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY });
  
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
  
    return res.json({ message: 'Login successful' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "verification_failed" });
  }
}

// ----------------------------------------------------------------------------

// Login with Twillio verification
exports.loginUserWithVerify = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP are required' });

  const verificationCheck = await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verificationChecks
    .create({ to: phone, code: otp });

  if (verificationCheck.status !== 'approved') {
    return res.status(401).json({ message: 'Invalid or expired OTP' });
  }

  const phoneRaw = phone.replace("+91", "");

  const user = await User.findOne({
    where: { phone: phoneRaw }
  });

  // If user does not exists
  if (!user) return res.status(402).json({ message: 'User does not exists/invalid credentials, Please register!' });

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, company: user.company, resumeName: user.resumeName, resumeURL: user.resumeURL }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'Lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });

  res.json({ message: 'Login successful' });

}


// Login - Vanilla version
exports.loginUser = async (req, res) => {
  const { phone } = req.body;

  const user = await User.findOne({
    where: { phone }
  });

  // If user does not exists
  if (!user) return res.status(401).json({ message: 'User does not exists/invalid credentials, Please register!' });

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, company: user.company, resumeName: user.resumeName, resumeURL: user.resumeURL }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'Lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });

  res.json({ message: 'Login successful' });

}

// GET /api/auth/me
exports.getMe = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {

    let user = jwt.verify(token, process.env.JWT_SECRET);

    res.json({ user });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
