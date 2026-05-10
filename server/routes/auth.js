const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { protect, signToken } = require('../middleware/auth');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      country: user.country,
      language: user.language,
      storeId: user.storeId,
      authProvider: user.googleId ? 'google' : 'local',
    },
  });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, country = 'MA', language = 'en' } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered.' });

    const user = await User.create({ name, email, password, country, language });
    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required.' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.password) return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    if (!user.isActive) return res.status(401).json({ success: false, message: 'Account has been deactivated.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// POST /api/auth/google  
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ success: false, message: 'Google credential required.' });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });
    if (user) {
      if (!user.googleId) { user.googleId = googleId; }
      if (!user.avatar && picture) user.avatar = picture;
      await user.save();
    } else {
      user = await User.create({ name, email, googleId, avatar: picture || '', role: 'buyer' });
    }

    if (!user.isActive) return res.status(401).json({ success: false, message: 'Account has been deactivated.' });
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ success: false, message: 'Google authentication failed.' });
  }
});

// POST /api/auth/google-access (Supports frontend flow)
router.post('/google-access', async (req, res) => {
  try {
    const { email, name, picture, sub: googleId } = req.body;
    console.log('Google Auth Request:', { email, name, googleId });
    
    if (!email || !googleId) {
      console.log('Missing data:', { email, googleId });
      return res.status(400).json({ success: false, message: 'Missing user data.' });
    }

    let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });
    if (user) {
      console.log('User found, updating...', user.email);
      if (!user.googleId) user.googleId = googleId;
      if (!user.avatar && picture) user.avatar = picture;
      await user.save();
    } else {
      console.log('Creating new user...', email);
      user = await User.create({ name, email, googleId, avatar: picture || '', role: 'buyer' });
    }

    if (!user.isActive) return res.status(401).json({ success: false, message: 'Account has been deactivated.' });
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Google access auth error:', err);
    res.status(500).json({ success: false, message: 'Google authentication failed: ' + err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        country: user.country,
        language: user.language,
        storeId: user.storeId,
        favorites: user.favorites,
        collections: user.collections,
        authProvider: user.googleId ? 'google' : 'local',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching user.' });
  }
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, country, language } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (country) updates.country = country;
    if (language) updates.language = language;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating profile.' });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: 'Both passwords required.' });
    if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });

    const user = await User.findById(req.user._id).select('+password');
    if (!user.password) return res.status(400).json({ success: false, message: 'This account uses Google Sign-In.' });
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect.' });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error changing password.' });
  }
});

// POST /api/auth/favorites/:productId
router.post('/favorites/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const pid = req.params.productId;
    if (!user.favorites.some(id => id.toString() === pid)) {
      user.favorites.push(pid);
      await user.save();
      // Increment product favorite count
      const Product = require('../models/Product');
      await Product.findByIdAndUpdate(pid, { $inc: { favoriteCount: 1 } });
    }
    res.json({ success: true, favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating favorites.' });
  }
});

// DELETE /api/auth/favorites/:productId
router.delete('/favorites/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const pid = req.params.productId;
    if (user.favorites.includes(pid)) {
      user.favorites = user.favorites.filter(id => id.toString() !== pid);
      await user.save();
      // Decrement product favorite count
      const Product = require('../models/Product');
      await Product.findByIdAndUpdate(pid, { $inc: { favoriteCount: -1 } });
    }
    res.json({ success: true, favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating favorites.' });
  }
});

// DELETE /api/auth/account
router.delete('/account', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    res.json({ success: true, message: 'Account deactivated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting account.' });
  }
});

module.exports = router;
