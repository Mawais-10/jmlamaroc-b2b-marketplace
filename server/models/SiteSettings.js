const mongoose = require('mongoose');

const SiteSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'general'
  },
  email: {
    type: String,
    default: 'contact@jmlamaroc.com'
  },
  phoneNumber: {
    type: String,
    default: '0779 137 560'
  },
  whatsappNumber: {
    type: String,
    default: '212779137560'
  },
  instagramLink: {
    type: String,
    default: 'https://instagram.com'
  },
  facebookLink: {
    type: String,
    default: 'https://facebook.com'
  },
  linkedinLink: {
    type: String,
    default: 'https://linkedin.com'
  }
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', SiteSettingsSchema);
