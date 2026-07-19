const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  handle: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, default: '' },
  avatar: { type: String, default: '' }, // Cloudinary URL
  avatarPublicId: { type: String, default: '' },
  coverImages: [{ url: String, publicId: String }],
  categories: [{ type: String }],
  city: { type: String, default: '' },
  country: { type: String, default: 'Morocco' },
  telegramHandle: { type: String, default: '' },
  telegramLink: { type: String, default: '' },
  whatsappNumber: { type: String, default: '' },
  whatsappLink: { type: String, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isApproved: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  followerCount: { type: Number, default: 0 },
  productCount: { type: Number, default: 0 },
  // Telegram sync tracking
  telegramSyncStatus: { type: String, enum: ['idle', 'syncing', 'completed', 'failed'], default: 'idle' },
  telegramSyncProgress: { type: Number, default: 0 },
  telegramSyncError: { type: String, default: '' },
  lastTelegramSync: { type: Date, default: null },
}, { timestamps: true });

// Update product count middleware
storeSchema.methods.updateProductCount = async function () {
  const Product = mongoose.model('Product');
  this.productCount = await Product.countDocuments({ store: this._id, isActive: true });
  await this.save();
};

module.exports = mongoose.model('Store', storeSchema);
