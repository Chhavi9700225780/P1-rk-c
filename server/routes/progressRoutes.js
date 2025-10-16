// server/routes/progressRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Progress = require('../models/progressSchema');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// Load gita data to know verses per chapter
const gitaPath = path.join(__dirname, '..', 'data', 'gita.json');
let gita = [];
try {
  gita = JSON.parse(fs.readFileSync(gitaPath, 'utf8'));
} catch (e) {
  console.warn('Could not load gita.json for progress routes', e && e.message);
}

// Utility: get verse numbers for a chapter
function verseIdsForChapter(chapter) {
  return gita
    .filter(v => Number(v.chapter) === Number(chapter))
    .map(v => Number(v.verse));
}

// Normalize userId depending on schema type
function normalizeUserId(userId) {
  try {
    // If it's already an ObjectId string, convert
    return mongoose.Types.ObjectId.isValid(userId)
      ? mongoose.Types.ObjectId(userId)
      : String(userId);
  } catch {
    return String(userId);
  }
}

// ---------------- Routes ----------------

// GET /progress/me -> summary per chapter
// ---------------- Routes ----------------

// GET /progress/me -> summary per chapter
router.get('/me', auth, async (req, res) => {
  try {
    const rawUserId = req.user._id || req.user.id;
    let userId = rawUserId;

    if (mongoose.Types.ObjectId.isValid(rawUserId)) {
      userId = new mongoose.Types.ObjectId(rawUserId);
    }

    console.log("➡️ /progress/me called by userId:", userId);

    const agg = await Progress.aggregate([
      {
        $match: {
          userId: userId,
          $or: [
            { completed: true },
            { completed: "true" }
          ]
        }
      },
      { $group: { _id: '$chapter', completedCount: { $sum: 1 } } }
    ]);

    console.log("📊 Aggregation result:", JSON.stringify(agg, null, 2));

    const chapters = {};
    gita.forEach(v => {
      const ch = Number(v.chapter);
      chapters[ch] = chapters[ch] || { chapter: ch, totalVerses: 0, completedCount: 0 };
      chapters[ch].totalVerses += 1;
    });

    agg.forEach(a => {
      const ch = Number(a._id);
      if (!chapters[ch]) chapters[ch] = { chapter: ch, totalVerses: 0, completedCount: 0 };
      chapters[ch].completedCount = a.completedCount;
    });

    const result = Object.values(chapters)
      .sort((a, b) => a.chapter - b.chapter)
      .map(c => ({
        ...c,
        percent: c.totalVerses
          ? Math.round((c.completedCount / c.totalVerses) * 100)
          : 0
      }));

    console.log("✅ Final result sent to client:", JSON.stringify(result, null, 2));

    return res.json({ ok: true, chapters: result });
  } catch (err) {
    console.error('❌ GET /progress/me error', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});



// GET /progress/me/chapter/:chapterId -> detailed verses status
router.get('/me/chapter/:chapterId', auth, async (req, res) => {
  try {
    const rawUserId = req.user._id || req.user.id;
    const userId = normalizeUserId(rawUserId);
    const chapterId = Number(req.params.chapterId);
    const verseNums = verseIdsForChapter(chapterId);

    const docs = await Progress.find({ userId, chapter: chapterId }).lean().exec();
    const byVerse = {};
    docs.forEach(d => {
      byVerse[Number(d.verse)] = {
        completed: !!d.completed,
        completedAt: d.completedAt || null
      };
    });

    const list = verseNums.map(v => ({
      verse: v,
      completed: !!(byVerse[v] && byVerse[v].completed),
      completedAt: (byVerse[v] && byVerse[v].completedAt) || null
    }));

    return res.json({ ok: true, chapter: chapterId, verses: list });
  } catch (err) {
    console.error('GET /progress/me/chapter error', err);
    return res.status(500).json({ ok: false, message: 'Server error', error: err.message });
  }
});

// POST /progress/me/verse -> set a single verse state
router.post('/me/verse', auth, async (req, res) => {
  try {
    const rawUserId = req.user._id || req.user.id;
    const userId = normalizeUserId(rawUserId);
    const { chapter, verse, completed } = req.body;

    if (!chapter || !verse || typeof completed !== 'boolean') {
      return res
        .status(400)
        .json({ ok: false, message: 'chapter, verse, and completed (boolean) are required' });
    }

    const filter = { userId, chapter: Number(chapter), verse: Number(verse) };
    const update = {
      $set: { completed: !!completed, completedAt: completed ? new Date() : null }
    };
    const opts = { upsert: true, new: true, setDefaultsOnInsert: true };

    const doc = await Progress.findOneAndUpdate(filter, update, opts).exec();

    return res.json({
      ok: true,
      progress: {
        chapter: Number(chapter),
        verse: Number(verse),
        completed: !!completed,
        completedAt: completed ? doc.completedAt : null
      }
    });
  } catch (err) {
    console.error('POST /progress/me/verse error', err);
    return res.status(500).json({ ok: false, message: 'Server error', error: err.message });
  }
});
// GET /progress/me -> summary per chapter
// GET /progress/me -> summary per chapter


// POST /progress/me/chapter -> mark multiple verses
router.post('/me/chapter', auth, async (req, res) => {
  try {
    const rawUserId = req.user._id || req.user.id;
    const userId = normalizeUserId(rawUserId);
    const { chapterId, verseIds, completed } = req.body;

    if (!chapterId || typeof completed !== 'boolean') {
      return res
        .status(400)
        .json({ ok: false, message: 'chapterId and completed (boolean) are required' });
    }

    let targets =
      Array.isArray(verseIds) && verseIds.length
        ? verseIds.map(Number)
        : verseIdsForChapter(Number(chapterId));

    if (!targets || !targets.length) {
      return res.status(400).json({ ok: false, message: 'No verses found for given chapter' });
    }

    const bulkOps = targets.map(v => {
      const filter = { userId, chapter: Number(chapterId), verse: Number(v) };
      return {
        updateOne: {
          filter,
          update: { $set: { completed, completedAt: completed ? new Date() : null } },
          upsert: true
        }
      };
    });

    if (bulkOps.length) {
      await Progress.bulkWrite(bulkOps);
    }

    return res.json({
      ok: true,
      chapterId: Number(chapterId),
      completed,
      affected: targets.length
    });
  } catch (err) {
    console.error('POST /progress/me/chapter error', err);
    return res.status(500).json({ ok: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;
