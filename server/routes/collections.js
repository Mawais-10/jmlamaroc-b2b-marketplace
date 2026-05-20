const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const { protect } = require('../middleware/auth');

// Get user's collections
router.get('/', protect, async (req, res) => {
  try {
    const collections = await Collection.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, collections });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new collection
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, color, items } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const collection = await Collection.create({
      user: req.user._id,
      name,
      description,
      color,
      items: items || []
    });

    res.status(201).json({ success: true, collection });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update a collection
router.patch('/:id', protect, async (req, res) => {
  try {
    const { name, description, color, items } = req.body;
    
    let collection = await Collection.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    if (name) collection.name = name;
    if (description !== undefined) collection.description = description;
    if (color) collection.color = color;
    if (items) collection.items = items;
    
    collection.updatedAt = Date.now();
    await collection.save();

    res.json({ success: true, collection });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a collection
router.delete('/:id', protect, async (req, res) => {
  try {
    const collection = await Collection.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    res.json({ success: true, message: 'Collection deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add item to collection
router.post('/:id/items', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const collection = await Collection.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    if (!collection.items.includes(productId)) {
      collection.items.push(productId);
      collection.updatedAt = Date.now();
      await collection.save();
    }

    res.json({ success: true, collection });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
