/** MongoDB schema for dead letters:

Fields: userId, title, message, videoLink, scheduledDate, and isTriggered */

const mongoose = require("mongoose");

const letterSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  videoLink: { type: String },
  scheduledDate: { type: Date, required: true },
  isTriggered: { type: Boolean, default: false },
});

module.exports = mongoose.model("Letter", letterSchema);