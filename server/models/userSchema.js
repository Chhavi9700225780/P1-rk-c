// server/models/userSchema.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    phone: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, sparse: true },
    displayName: { type: String },
    avatarUrl: { type: String },
    japaCount: {
      type: Number,
      default: 0,
    },
    // any other profile fields
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
