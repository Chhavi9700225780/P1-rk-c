// server/models/progressSchema.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const progressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  chapter: { type: Number, required: true, index: true },
  verse: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
}, { timestamps: true });

// Unique per user + chapter + verse
progressSchema.index({ userId: 1, chapter: 1, verse: 1 }, { unique: true });

module.exports = mongoose.model('UserVerseProgress', progressSchema);
