// server/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const OTP = require("../models/otpSchema");
const User = require("../models/userSchema");
// const { sendSms } = require("../utils/sendSms"); // SMS disabled for now
const sendEmail = require("../utils/sendEmail");

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES || 10);
const OTP_LENGTH = Number(process.env.OTP_LENGTH || 6);
const OTP_ATTEMPTS = Number(process.env.OTP_ATTEMPTS || 5);
const DEV_SHOW_OTP =
  process.env.DEV_SHOW_OTP === "true" || process.env.NODE_ENV !== "production";

// helper: generate numeric OTP of length N
function generateNumericOtp(length = 6) {
  const max = 10 ** length;
  const num = crypto.randomInt(0, max).toString().padStart(length, "0");
  return num;
}

// -------------------- SEND OTP --------------------
router.post("/send-otp", async (req, res) => {
  try {
    const { phone, email } = req.body;

    if (phone) {
      return res.status(400).json({
        ok: false,
        message: "SMS-based OTP is disabled. Please use email for OTP login.",
      });
    }
    if (!email) {
      return res.status(400).json({ ok: false, message: "email required" });
    }

    const otp = generateNumericOtp(OTP_LENGTH);
    const otpHash = await bcrypt.hash(otp, 10);
    const deliveryTarget = email;
    const otpType = "email";
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    const otpDoc = new OTP({
      deliveryTarget,
      otpHash,
      otpType,
      attemptsLeft: OTP_ATTEMPTS,
      expiresAt,
    });
    await otpDoc.save();

    const subject = "Your OTP code";
    const text = `Your OTP code is ${otp}. It will expire in ${OTP_TTL_MINUTES} minutes.`;

    try {
      const emailRes = await sendEmail({
        subject,
        email: deliveryTarget,
        message: text,
        name: "Gita App",
      });
      if (!emailRes.ok) console.warn("sendEmail returned non-ok:", emailRes);
    } catch (emailErr) {
      console.error("sendEmail error:", emailErr);
    }

    const responsePayload = { ok: true, message: "OTP sent", otpId: otpDoc._id };
    if (DEV_SHOW_OTP) responsePayload.otp = otp; // dev only

    return res.json(responsePayload);
  } catch (err) {
    console.error("send-otp error:", err?.message || err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

// -------------------- VERIFY OTP --------------------
router.post("/verify-otp", async (req, res) => {
  try {
    const { otpId, deliveryTarget, otp } = req.body;
    if (!otp)
      return res.status(400).json({ ok: false, message: "otp required" });

    const query = otpId ? { _id: otpId } : { deliveryTarget };
    const otpDoc = await OTP.findOne(query).sort({ createdAt: -1 }).exec();
    if (!otpDoc)
      return res.status(400).json({ ok: false, message: "OTP not found or expired" });

    if (otpDoc.used)
      return res.status(400).json({ ok: false, message: "OTP already used" });

    if (otpDoc.attemptsLeft <= 0)
      return res.status(429).json({ ok: false, message: "Too many failed attempts" });

    if (otpDoc.expiresAt < new Date()) {
      return res.status(400).json({ ok: false, message: "OTP expired" });
    }

    const match = await bcrypt.compare(otp, otpDoc.otpHash);
    if (!match) {
      otpDoc.attemptsLeft = Math.max(0, otpDoc.attemptsLeft - 1);
      await otpDoc.save();
      return res.status(400).json({ ok: false, message: "Invalid OTP" });
    }

    otpDoc.used = true;
    await otpDoc.save();

    const target = otpDoc.deliveryTarget;
    let user = await User.findOne({ email: target }).exec();
    if (!user) user = await User.create({ email: target });

    const payload = { sub: user._id.toString() };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // ✅ FIXED cookie options for dev vs prod
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // false in dev
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: parseJwtExpiryMs(JWT_EXPIRES_IN),
    };

    res.cookie("session", token, cookieOptions);
console.log("cookies received:", req.cookies);
    return res.json({
      ok: true,
      message: "Verified",
      user: {
        id: user._id,
        phone: user.phone || null,
        email: user.email,
        displayName: user.displayName || null,
      },
    });
  } catch (err) {
    console.error("verify-otp error:", err?.message || err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});


// -------------------- HELPERS --------------------
function parseJwtExpiryMs(exp) {
  if (typeof exp === "number") return exp * 1000;
  if (typeof exp !== "string") return 7 * 24 * 3600 * 1000;
  const match = exp.match(/^(\d+)([smhd])$/);
  if (!match) {
    if (!isNaN(Number(exp))) return Number(exp) * 1000;
    return 7 * 24 * 3600 * 1000;
  }
  const val = Number(match[1]);
  const unit = match[2];
  switch (unit) {
    case "s": return val * 1000;
    case "m": return val * 60 * 1000;
    case "h": return val * 3600 * 1000;
    case "d": return val * 24 * 3600 * 1000;
    default:  return val * 1000;
  }
}

// -------------------- GET ME --------------------
router.get("/me", async (req, res) => {
  try {
    const token = req.cookies?.session;
    if (!token) return res.json({ ok: true, user: null });

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.json({ ok: true, user: null });
    }

    const user = await User.findById(payload.sub).select("-__v").lean().exec();
    if (!user) return res.json({ ok: true, user: null });
    return res.json({ ok: true, user });
  } catch (err) {
    console.error("auth/me error:", err?.message || err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});
// PATCH /auth/me -> update profile fields
router.patch("/me", async (req, res) => {
  try {
    const token = req.cookies?.session;
    if (!token) return res.status(401).json({ ok: false, message: "Not authenticated" });

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ ok: false, message: "Invalid token" });
    }

    const userId = payload.sub;
    const { displayName, avatarUrl } = req.body;

    const update = {};
    if (typeof displayName === "string" && displayName.trim()) {
      update.displayName = displayName.trim();
    }
    if (typeof avatarUrl === "string" && avatarUrl.trim()) {
      update.avatarUrl = avatarUrl.trim();
    }

    if (!Object.keys(update).length) {
      return res.status(400).json({ ok: false, message: "No valid fields provided" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true, lean: true }
    ).select("-__v");

    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    return res.json({ ok: true, user });
  } catch (err) {
    console.error("PATCH /auth/me error", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

// -------------------- LOGOUT --------------------
router.post("/logout", (req, res) => {
  res.clearCookie("session", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res.json({ ok: true, message: "Logged out" });
});

module.exports = router;
