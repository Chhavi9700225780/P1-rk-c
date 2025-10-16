const express = require('express');
const router = express.Router();
const Favourite = require('../models/Favourite');
const auth = require('../middleware/auth'); // adapt to your auth middleware

// GET /favourites/me
router.get('/me', auth, async (req, res) => {
  try {
    const favs = await Favourite.find({ user: req.user._id }).sort('-createdAt').lean();
    return res.json({ ok: true, favourites: favs });
  } catch (err) {
    console.error('GET /favourites/me error', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

router.post('/toggle', auth, async (req, res) => {
  try {
    const { chapter, verse } = req.body;
    if (typeof chapter === 'undefined' || typeof verse === 'undefined') {
      return res.status(400).json({ ok: false, message: 'Missing chapter or verse' });
    }

    const existing = await Favourite.findOne({
      user: req.user._id,
      chapter: Number(chapter),
      verse: Number(verse),
    });

    if (existing) {
      // safe removal (works whether `existing` is a doc or plain object)
      await Favourite.deleteOne({ _id: existing._id });
      return res.json({ ok: true, favourite: false });
    } else {
      const item = await Favourite.create({
        user: req.user._id,
        chapter: Number(chapter),
        verse: Number(verse),
      });
      return res.json({ ok: true, favourite: true, item });
    }
  } catch (err) {
    console.error('POST /favourites/toggle error', err);
    if (err.code === 11000) {
      return res.json({ ok: true, favourite: true });
    }
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});


module.exports = router;
