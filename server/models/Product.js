const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  storeName: { type: String, required: true },
  storeHandle: { type: String, required: true },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  imageUrl: { type: String, required: true }, // Cloudinary URL
  imagePublicId: { type: String, default: '' },
  price: { type: Number, default: null },
  currency: { type: String, default: 'MAD' },
  category: { type: String, required: true },
  subcategory: { type: String, default: '' },
  tags: [{ type: String }],
  isActive: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  favoriteCount: { type: Number, default: 0 },
  vector: { type: [Number], default: [] },
  // Telegram import fields
  source: { type: String, enum: ['manual', 'telegram'], default: 'manual' },
  sourceChannel: { type: String, default: '' },
  sourceMessageId: { type: Number, default: null },
  needsReview: { type: Boolean, default: false },
}, { timestamps: true });

// Index for search
productSchema.index({ description: 'text', title: 'text', storeName: 'text', category: 'text', tags: 'text' });
productSchema.index({ store: 1, isActive: 1 });
productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ sourceMessageId: 1, sourceChannel: 1 }, { sparse: true });

module.exports = mongoose.model('Product', productSchema);
