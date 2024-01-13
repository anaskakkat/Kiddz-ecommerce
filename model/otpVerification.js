const mongoose = require('mongoose');

const otpVerifySchema = new mongoose.Schema({
  email_id: String,
  otp: String,
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date
});

const otpSchema = mongoose.model('otps', otpVerifySchema);

module.exports = otpSchema;
