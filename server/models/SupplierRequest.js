const mongoose = require('mongoose');

const supplierRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  businessName: { type: String, required: true, trim: true },
  storeHandle: { type: String, required: true, lowercase: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, default: 'Morocco' },
  whatsappNumber: { type: String, required: true },
  telegramHandle: { type: String, default: '' },
  message: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  adminNote: { type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  storeCreated: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
}, { timestamps: true });

module.exports = mongoose.model('SupplierRequest', supplierRequestSchema);
