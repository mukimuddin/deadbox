const express = require("express");
const router = express.Router();
const Letter = require("../models/Letter");
const auth = require("../middleware/auth");
const User = require("../models/User");

// Get all letters for the authenticated user
router.get("/", auth, async (req, res) => {
  try {
    const letters = await Letter.find({ userId: req.user._id });
    res.json(letters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new letter
router.post("/", auth, async (req, res) => {
  try {
    const { title, message, videoLink, scheduledDate, triggerType, inactivityDays } = req.body;
    
    const letter = new Letter({
      userId: req.user._id,
      title,
      message,
      videoLink,
      scheduledDate,
      triggerType,
      inactivityDays
    });
    
    await letter.save();
    res.status(201).json(letter);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a letter
router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const letter = await Letter.findOne({ _id: id, userId: req.user._id });
    
    if (!letter) {
      return res.status(404).json({ error: "Letter not found" });
    }
    
    const updatedLetter = await Letter.findByIdAndUpdate(
      id,
      { ...req.body, userId: req.user._id },
      { new: true }
    );
    
    res.json(updatedLetter);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a letter
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const letter = await Letter.findOne({ _id: id, userId: req.user._id });
    
    if (!letter) {
      return res.status(404).json({ error: "Letter not found" });
    }
    
    await Letter.findByIdAndDelete(id);
    res.json({ message: "Letter deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Family unlock route
router.post("/:id/unlock", async (req, res) => {
  try {
    const { id } = req.params;
    const { familyKey } = req.body;
    
    const letter = await Letter.findById(id);
    if (!letter) {
      return res.status(404).json({ error: "Letter not found" });
    }
    
    const user = await User.findById(letter.userId);
    if (!user || user.familyKey !== familyKey) {
      return res.status(401).json({ error: "Invalid family key" });
    }
    
    letter.isUnlocked = true;
    letter.unlockDate = new Date();
    await letter.save();
    
    res.json(letter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;