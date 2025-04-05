/** Routes for triggers and email delivery:

Trigger check (last activity)

Email sending logic with Nodemailer */

const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Letter = require("../models/Letter");

// Trigger check (last activity)
router.post("/trigger", async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const inactiveDays = (Date.now() - new Date(user.lastActivity)) / (1000 * 60 * 60 * 24);

    if (inactiveDays > 30) {
      // Trigger letters
      const letters = await Letter.find({ userId, isTriggered: false });
      letters.forEach(async (letter) => {
        // Send email logic here
        await sendEmail(user.email, letter);
        letter.isTriggered = true;
        await letter.save();
      });
      return res.json({ message: "Letters triggered" });
    }

    res.json({ message: "User is still active" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Email sending logic
const sendEmail = async (to, letter) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `Dead Letter: ${letter.title}`,
    text: letter.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = router;