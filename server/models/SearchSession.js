const mongoose = require('mongoose');

const SearchSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  filters: {
    q: String,
    category: String,
    storeId: String,
    sortBy: String,
    priceOnly: Boolean,
    showDuplicates: Boolean,
    uploadedImage: String,
  },
  createdAt: { type: Date, default: Date.now, expires: '7d' } // Automatically delete after 7 days
});

module.exports = mongoose.model('SearchSession', SearchSessionSchema);
