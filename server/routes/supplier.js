const express = require('express');
const router = express.Router();
const SupplierRequest = require('../models/SupplierRequest');
const Store = require('../models/Store');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, requireSupplier } = require('../middleware/auth');
const { uploadProduct, uploadAvatar, uploadCover, deleteImage } = require('../config/cloudinary');

// POST /api/supplier/apply - Buyer applies to become a supplier
router.post('/apply', protect, async (req, res) => {
  try {
    const { businessName, storeHandle, description, category, city, whatsappNumber, telegramHandle, message } = req.body;
    if (!businessName || !storeHandle || !category || !city || !whatsappNumber) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields.' });
    }

    // Check if handle is taken
    const existingStore = await Store.findOne({ handle: storeHandle.toLowerCase() });
    if (existingStore) return res.status(400).json({ success: false, message: 'Store handle already taken. Choose another.' });

    const existingRequest = await SupplierRequest.findOne({ user: req.user._id, status: 'pending' });
    if (existingRequest) return res.status(400).json({ success: false, message: 'You already have a pending supplier request.' });

    const request = await SupplierRequest.create({
      user: req.user._id,
      businessName,
      storeHandle: storeHandle.toLowerCase(),
      description,
      category,
      city,
      whatsappNumber,
      telegramHandle,
      message,
    });

    await User.findByIdAndUpdate(req.user._id, { supplierRequestId: request._id });

    res.status(201).json({ success: true, message: 'Supplier request submitted successfully! Admin will review it shortly.', request });
  } catch (err) {
    console.error('Apply supplier error:', err);
    res.status(500).json({ success: false, message: 'Error submitting supplier request.' });
  }
});

// GET /api/supplier/request-status - Check supplier request status
router.get('/request-status', protect, async (req, res) => {
  try {
    const request = await SupplierRequest.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error checking request status.' });
  }
});

// GET /api/supplier/store - Get own store
router.get('/store', protect, requireSupplier, async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) return res.status(404).json({ success: false, message: 'Store not found.' });
    res.json({ success: true, store });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching store.' });
  }
});

// PUT /api/supplier/store - Update own store info
router.put('/store', protect, requireSupplier, async (req, res) => {
  try {
    const { name, description, categories, city, telegramHandle, whatsappNumber } = req.body;
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) return res.status(404).json({ success: false, message: 'Store not found.' });

    if (name) store.name = name;
    if (description !== undefined) store.description = description;
    if (categories) store.categories = Array.isArray(categories) ? categories : categories.split(',').map(c => c.trim());
    if (city) store.city = city;
    if (telegramHandle !== undefined) {
      store.telegramHandle = telegramHandle;
      store.telegramLink = telegramHandle ? `https://t.me/${telegramHandle.replace('@', '')}` : '';
    }
    if (whatsappNumber !== undefined) {
      store.whatsappNumber = whatsappNumber;
      store.whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}` : '';
    }

    await store.save();
    res.json({ success: true, store });
  } catch (err) {
    console.error('Update store error:', err);
    res.status(500).json({ success: false, message: 'Error updating store.' });
  }
});

// POST /api/supplier/store/avatar - Upload store avatar
router.post('/store/avatar', protect, requireSupplier, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) return res.status(404).json({ success: false, message: 'Store not found.' });

    if (store.avatarPublicId) await deleteImage(store.avatarPublicId);

    store.avatar = req.file.path;
    store.avatarPublicId = req.file.filename;
    await store.save();
    res.json({ success: true, store, avatarUrl: req.file.path });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error uploading avatar.' });
  }
});

// POST /api/supplier/store/cover - Upload cover image
router.post('/store/cover', protect, requireSupplier, uploadCover.single('cover'), async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) return res.status(404).json({ success: false, message: 'Store not found.' });
    if (store.coverImages.length >= 4) {
      return res.status(400).json({ success: false, message: 'Maximum 4 cover images allowed.' });
    }

    store.coverImages.push({ url: req.file.path, publicId: req.file.filename });
    await store.save();
    res.json({ success: true, store, coverUrl: req.file.path });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error uploading cover image.' });
  }
});

// DELETE /api/supplier/store/cover/:index - Remove cover image
router.delete('/store/cover/:index', protect, requireSupplier, async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) return res.status(404).json({ success: false, message: 'Store not found.' });
    const idx = parseInt(req.params.index);
    if (idx >= 0 && idx < store.coverImages.length) {
      const removed = store.coverImages.splice(idx, 1)[0];
      if (removed.publicId) await deleteImage(removed.publicId);
    }
    await store.save();
    res.json({ success: true, store });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error removing cover image.' });
  }
});

// GET /api/supplier/products - Get own store products
router.get('/products', protect, requireSupplier, async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) return res.status(404).json({ success: false, message: 'Store not found.' });
    const products = await Product.find({ store: store._id }).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching products.' });
  }
});

// POST /api/supplier/products - Add new product with image
router.post('/products', protect, requireSupplier, uploadProduct.single('image'), async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) return res.status(404).json({ success: false, message: 'Store not found.' });
    if (!req.file) return res.status(400).json({ success: false, message: 'Product image is required.' });

    const { description, title, price, currency = 'MAD', category, subcategory, tags } = req.body;
    if (!category) return res.status(400).json({ success: false, message: 'Category is required.' });

    const product = await Product.create({
      store: store._id,
      storeName: store.name,
      storeHandle: store.handle,
      title: title || '',
      description: description || '',
      imageUrl: req.file.path,
      imagePublicId: req.file.filename,
      price: price ? parseFloat(price) : null,
      currency,
      category,
      subcategory: subcategory || '',
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
    });

    // Generate AI fingerprint for visual search
    try {
      const { generateEmbedding } = require('../utils/vision');
      const vector = await generateEmbedding(req.file.path);
      if (vector) {
        product.vector = vector;
        await product.save();
      }
    } catch (vErr) {
      console.error('Failed to generate visual fingerprint:', vErr);
    }

    // Update product count
    store.productCount = await Product.countDocuments({ store: store._id, isActive: true });
    await store.save();

    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error('Add product error:', err);
    res.status(500).json({ success: false, message: 'Error adding product.' });
  }
});

// PUT /api/supplier/products/:id - Update product
router.put('/products/:id', protect, requireSupplier, async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) return res.status(404).json({ success: false, message: 'Store not found.' });

    const product = await Product.findOne({ _id: req.params.id, store: store._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const { description, title, price, currency, category, subcategory, tags, isActive } = req.body;
    if (description !== undefined) product.description = description;
    if (title !== undefined) product.title = title;
    if (price !== undefined) product.price = price ? parseFloat(price) : null;
    if (currency) product.currency = currency;
    if (category) product.category = category;
    if (subcategory !== undefined) product.subcategory = subcategory;
    if (tags) product.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating product.' });
  }
});

// DELETE /api/supplier/products/:id - Delete product
router.delete('/products/:id', protect, requireSupplier, async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    const product = await Product.findOne({ _id: req.params.id, store: store._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    if (product.imagePublicId) await deleteImage(product.imagePublicId);
    await product.deleteOne();

    store.productCount = await Product.countDocuments({ store: store._id, isActive: true });
    await store.save();

    res.json({ success: true, message: 'Product deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting product.' });
  }
});

module.exports = router;
