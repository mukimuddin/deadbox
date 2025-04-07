/** MongoDB schema for users:

Fields: name, email, password (hashed), lastActivity, and familyAccessKey */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  familyKey: {
    type: String,
    required: true,
    minlength: 6
  },
  familyEmail: {
    type: String,
    required: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String
  },
  emailVerificationExpires: {
    type: Date
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  registrationDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();
  
  console.log('User model: pre-save hook triggered for password modification.');
  
  try {
    console.log('User model: Hashing password...');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('User model: Password hashed successfully.');
    next();
  } catch (error) {
    console.error('User model: Error hashing password:', error);
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  console.log('User model: Comparing password for user:', this.email);
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  console.log('User model: Password comparison result:', isMatch);
  return isMatch;
};

// Static method to find unverified accounts older than 7 days
userSchema.statics.findUnverifiedOlderThan7Days = function() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return this.find({
    isEmailVerified: false,
    registrationDate: { $lt: sevenDaysAgo }
  });
};

module.exports = mongoose.model("User", userSchema);