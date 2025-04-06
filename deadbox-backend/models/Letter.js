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
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  attachment: {
    url: String,
    type: String
  },
  videoLink: {
    type: String
  },
  scheduledDate: {
    type: Date,
    required: function() {
      return this.triggerType === 'date';
    }
  },
  triggerType: {
    type: String,
    enum: ['date', 'inactivity'],
    required: true
  },
  inactivityDays: {
    type: Number,
    required: function() {
      return this.triggerType === 'inactivity';
    },
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
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sent', 'failed'],
    default: 'draft'
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
letterSchema.index({ userId: 1, isDelivered: 1 });
letterSchema.index({ scheduledDate: 1, isDelivered: 1 });

// Update lastModified on save
letterSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

module.exports = mongoose.model("Letter", letterSchema);