// server/models/otpSchema.js
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    deliveryTarget: { type: String, required: true }, // phone number or email
    otpHash: { type: String, required: true },
    otpType: { type: String, enum: ["email"], required: true },
    attemptsLeft: { type: Number, default: 5 },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index to auto-clean expired OTPS (if using TTL index)
// Note: TTL index removes documents after expiresAt time — ensure expiration semantics you want.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("OTP", otpSchema);
