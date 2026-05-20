const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, select: false },
  googleId: { type: String, sparse: true },
  avatar: { type: String, default: '' },
  role: {
    type: String,
    enum: ['buyer', 'supplier', 'admin'],
    default: 'buyer',
  },
  country: { type: String, default: 'MA' },
  language: { type: String, default: 'en' },
  status: {
    type: String,
    enum: ['pending', 'approved', 'blocked'],
    default: 'pending',
  },
  isActive: { type: Boolean, default: true },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  collections: [{
    id: String,
    name: String,
    description: String,
    color: String,
    items: [String],
    createdAt: String,
  }],
  supplierRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'SupplierRequest' },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  firstLoginAt: { type: Date },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
