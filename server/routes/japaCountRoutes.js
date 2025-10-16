const express = require('express');
const router = express.Router();
const User = require('../models/userSchema');
const auth = require('../middleware/auth'); // Assuming this is your auth middleware

// @desc    Update user's japa count
// @route   PUT /api/japa/update-japa
// @access  Private
router.put('/update-japa', auth, async (req, res) => {
  const { count } = req.body;

  // Validate the incoming count
  if (typeof count !== 'number' || count <= 0) {
    return res.status(400).json({ ok: false, message: 'Invalid count provided.' });
  }

  try {
    // Find the user via the ID from the auth token and increment their japaCount
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { japaCount: count } }, // Atomically increment the count
      { new: true } // Option to return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ ok: false, message: 'User not found.' });
    }

    // Respond with a success message and the new total count
    res.status(200).json({
      ok: true,
      message: 'Japa count updated successfully!',
      japaCount: updatedUser.japaCount,
    });
  } catch (error) {
    console.error('Error updating Japa count:', error);
    res.status(500).json({ ok: false, message: 'Server error while updating count.' });
  }
});

// @desc    Get the current user's japa count
// @route   GET /api/japa/me
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    // Re-fetch the user to ensure the count is up-to-date
    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(404).json({ ok: false, message: 'User not found.' });
    }

    return res.json({ ok: true, japaCount: user.japaCount || 0 });
  } catch (err) {
    console.error('GET /japa/me error', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

module.exports = router;
