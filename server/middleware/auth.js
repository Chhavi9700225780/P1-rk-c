// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

module.exports = async function (req, res, next) {
  try {
    const token = req.cookies?.session;
    if (!token) return res.status(401).json({ ok: false, message: 'Not authenticated' });

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ ok: false, message: 'Invalid token' });
    }

    const user = await User.findById(payload.sub).lean().exec();
    if (!user) return res.status(401).json({ ok: false, message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    console.error('auth middleware error', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
};
