const express = require("express");
const router = express.Router();
const Letter = require("../models/Letter");

// Get all letters for a user
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    const letters = await Letter.find({ userId });
    res.json(letters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new letter
router.post("/", async (req, res) => {
  try {
    const { userId, title, message, videoLink, scheduledDate } = req.body;
    const letter = new Letter({ userId, title, message, videoLink, scheduledDate });
    await letter.save();
    res.status(201).json(letter);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a letter
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedLetter = await Letter.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedLetter);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a letter
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Letter.findByIdAndDelete(id);
    res.json({ message: "Letter deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;