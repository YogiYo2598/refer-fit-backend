// utils/otp.js
const crypto = require("crypto");

function generateOtp(digits = 6) {
  // returns a zero-padded numeric code
  const max = 10 ** digits;
  const code = crypto.randomInt(0, max).toString().padStart(digits, "0");
  return code;
}

function genNonce() {
  return crypto.randomBytes(16).toString("base64url"); // short random per-OTP
}

function hashOtp(phone, code, nonce, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(`${phone}:${code}:${nonce}`)
    .digest("hex");
}

function isE164(phone) {
  // very light check; adjust as you like
  return /^\+[1-9]\d{7,14}$/.test(phone) || /^[1-9]\d{7,14}$/.test(phone);
}

module.exports = { generateOtp, genNonce, hashOtp, isE164 };