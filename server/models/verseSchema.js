const mongoose = require("mongoose");

// Define a Mongoose schema for the "RandomVerse" collection
const verseSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },

  verse_number: {
    type: Number,
    required: true,
  },
  chapter_number: {
    type: Number,
    required: true,
  },
  slug:{
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  translations: [{
    
  }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("RandomVerse", verseSchema);