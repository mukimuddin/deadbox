/** MongoDB schema for dead letters:

Fields: userId, title, message, videoLink, scheduledDate, and isTriggered */

const mongoose = require("mongoose");

const letterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  videoLink: {
    type: String
  },
  scheduledDate: {
    type: Date
  },
  triggerType: {
    type: String,
    enum: ['date', 'inactivity'],
    required: true
  },
  inactivityDays: {
    type: Number,
    min: 1
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveryDate: {
    type: Date
  },
  isUnlocked: {
    type: Boolean,
    default: false
  },
  unlockDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient querying
letterSchema.index({ userId: 1, isDelivered: 1 });
letterSchema.index({ scheduledDate: 1, isDelivered: 1 });

module.exports = mongoose.model("Letter", letterSchema);