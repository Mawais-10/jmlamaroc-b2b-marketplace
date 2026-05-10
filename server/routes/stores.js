const express = require('express');
const router = express.Router();
const Store = require('../models/Store');
const Product = require('../models/Product');

// GET /api/stores - List all approved stores
router.get('/', async (req, res) => {
  try {
    const { search, category, city, sort = 'productCount', page = 1, limit = 50 } = req.query;
    const query = { isApproved: true, isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { handle: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category && category !== 'all') {
      query.categories = { $regex: category, $options: 'i' };
    }
    if (city) query.city = { $regex: city, $options: 'i' };

    const sortMap = {
      mostProducts: { productCount: -1 },
      leastProducts: { productCount: 1 },
      nameAsc: { name: 1 },
      nameDesc: { name: -1 },
    };

    let stores = await Store.find(query)
      .sort(sortMap[sort] || { productCount: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Fetch top 3 products for each store to show in preview
    stores = await Promise.all(stores.map(async (s) => {
      const topProducts = await Product.find({ store: s._id, isActive: true })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('imageUrl');
      
      const storeObj = s.toObject();
      storeObj.previewProducts = topProducts;
      return storeObj;
    }));

    const total = await Store.countDocuments(query);

    res.json({ success: true, stores, total, page: Number(page) });
  } catch (err) {
    console.error('Get stores error:', err);
    res.status(500).json({ success: false, message: 'Error fetching stores.' });
  }
});

// GET /api/stores/:handle
router.get('/:handle', async (req, res) => {
  try {
    const store = await Store.findOne({
      handle: req.params.handle.toLowerCase(),
      isApproved: true,
      isActive: true,
    }).populate('owner', 'name email');

    if (!store) return res.status(404).json({ success: false, message: 'Store not found.' });

    const products = await Product.find({ store: store._id, isActive: true })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, store, products });
  } catch (err) {
    console.error('Get store error:', err);
    res.status(500).json({ success: false, message: 'Error fetching store.' });
  }
});

module.exports = router;
