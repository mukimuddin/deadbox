const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { commonRules, validateInput } = require('../middleware/validation');
const Letter = require('../models/Letter');

// Create a new letter
router.post('/', 
  authenticate,
  [
    commonRules.title,
    commonRules.message,
    commonRules.triggerType,
    commonRules.scheduledDate,
    commonRules.inactivityDays
  ],
  validateInput,
  async (req, res) => {
    try {
      const letter = new Letter({
        ...req.body,
        userId: req.user._id
      });
      await letter.save();
      res.status(201).json(letter);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Get all letters for the authenticated user
router.get('/', 
  authenticate,
  async (req, res) => {
    try {
      const letters = await Letter.find({ userId: req.user._id });
      res.json(letters);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get a specific letter
router.get('/:id', 
  authenticate,
  async (req, res) => {
    try {
      const letter = await Letter.findOne({
        _id: req.params.id,
        userId: req.user._id
      });
      if (!letter) {
        return res.status(404).json({ error: 'Letter not found' });
      }
      res.json(letter);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Update a letter
router.put('/:id', 
  authenticate,
  [
    commonRules.title,
    commonRules.message,
    commonRules.triggerType,
    commonRules.scheduledDate,
    commonRules.inactivityDays
  ],
  validateInput,
  async (req, res) => {
    try {
      const letter = await Letter.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        req.body,
        { new: true }
      );
      if (!letter) {
        return res.status(404).json({ error: 'Letter not found' });
      }
      res.json(letter);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Delete a letter
router.delete('/:id', 
  authenticate,
  async (req, res) => {
    try {
      const letter = await Letter.findOneAndDelete({
        _id: req.params.id,
        userId: req.user._id
      });
      if (!letter) {
        return res.status(404).json({ error: 'Letter not found' });
      }
      res.json({ message: 'Letter deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router; 