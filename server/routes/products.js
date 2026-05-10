const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Store = require('../models/Store');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { q, category, subcategory, storeId, priceOnly, sort = 'newest', fromDate, toDate, page = 1, limit = 40, ids } = req.query;
    
    const query = { isActive: true };

    if (ids) {
      const idArray = ids.split(',');
      query._id = { $in: idArray };
    } else {
      // Only show products from approved stores when browsing
      const approvedStores = await Store.find({ isApproved: true, isActive: true }).select('_id');
      const approvedStoreIds = approvedStores.map(s => s._id);
      query.store = storeId ? storeId : { $in: approvedStoreIds };
    }

    if (q) {
      query.$or = [
        { description: { $regex: q, $options: 'i' } },
        { title: { $regex: q, $options: 'i' } },
        { storeName: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ];
    }
    if (category) {
      query.category = { $regex: category.replace(/-/g, ' '), $options: 'i' };
    }
    if (subcategory) query.subcategory = { $regex: subcategory, $options: 'i' };
    if (storeId && !ids) query.store = storeId;
    if (priceOnly === 'true') query.price = { $ne: null, $gt: 0 };
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate + 'T23:59:59');
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      priceAsc: { price: 1 },
      priceDesc: { price: -1 },
      trending: { favoriteCount: -1 },
    };

    const products = await Product.find(query)
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({ success: true, products, total, page: Number(page) });
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ success: false, message: 'Error fetching products.' });
  }
});

// GET /api/products/trending
router.get('/trending', async (req, res) => {
  try {
    const pipeline = [
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, latest: { $last: '$$ROOT' } } },
      { $sort: { count: -1 } },
      { $limit: 12 },
    ];
    const trending = await Product.aggregate(pipeline);
    res.json({ success: true, trending });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching trending.' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    // Increment views
    product.views = (product.views || 0) + 1;
    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching product.' });
  }
});

module.exports = router;
