const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { authenticate } = require('../middleware/auth');
const { commonRules, validateInput } = require('../middleware/validation');
const Letter = require('../models/Letter');
const User = require('../models/User');

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|mp4|mov|avi|pdf|doc|docx)$/)) {
      return cb(new Error('Please upload a valid file'));
    }
    cb(null, true);
  }
});

// Create a new letter
router.post('/', 
  authenticate,
  upload.single('attachment'),
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
      let attachmentUrl = null;
      let attachmentType = null;

      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: 'auto'
        });
        attachmentUrl = result.secure_url;
        attachmentType = req.file.mimetype;
      }

      const letter = new Letter({
        ...req.body,
        userId: req.user._id,
        attachment: attachmentUrl ? {
          url: attachmentUrl,
          type: attachmentType
        } : undefined
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
      const letters = await Letter.find({ userId: req.user._id })
        .sort({ createdAt: -1 });
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
  upload.single('attachment'),
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
      const letter = await Letter.findOne({
        _id: req.params.id,
        userId: req.user._id
      });

      if (!letter) {
        return res.status(404).json({ error: 'Letter not found' });
      }

      if (req.file) {
        // Delete old attachment from Cloudinary if exists
        if (letter.attachment?.url) {
          const publicId = letter.attachment.url.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        }

        // Upload new attachment
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: 'auto'
        });
        letter.attachment = {
          url: result.secure_url,
          type: req.file.mimetype
        };
      }

      // Update other fields
      Object.keys(req.body).forEach(key => {
        letter[key] = req.body[key];
      });

      await letter.save();
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
      const letter = await Letter.findOne({
        _id: req.params.id,
        userId: req.user._id
      });

      if (!letter) {
        return res.status(404).json({ error: 'Letter not found' });
      }

      // Delete attachment from Cloudinary if exists
      if (letter.attachment?.url) {
        const publicId = letter.attachment.url.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }

      await letter.delete();
      res.json({ message: 'Letter deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Family unlock route
router.post('/:id/unlock', async (req, res) => {
  try {
    const { id } = req.params;
    const { familyKey } = req.body;
    
    const letter = await Letter.findById(id);
    if (!letter) {
      return res.status(404).json({ error: 'Letter not found' });
    }
    
    const user = await User.findById(letter.userId);
    if (!user || user.familyKey !== familyKey) {
      return res.status(401).json({ error: 'Invalid family key' });
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