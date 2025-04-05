const express = require("express");
const router = express.Router();
const Item = require("./models/Item");

// Get all items
router.get("/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new item
router.post("/items", async (req, res) => {
  const item = new Item({
    name: req.body.name,
    description: req.body.description,
  });
  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;