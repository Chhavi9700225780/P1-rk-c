const mongoose = require('mongoose');
const { Schema } = mongoose;

const FavouriteSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  chapter: { type: Number, required: true },
  verse: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

// unique per user + chapter + verse
FavouriteSchema.index({ user: 1, chapter: 1, verse: 1 }, { unique: true });

module.exports = mongoose.model('Favourite', FavouriteSchema);
