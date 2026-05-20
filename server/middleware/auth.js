const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ success: false, message: 'Not authenticated. Please log in.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'User not found or deactivated.' });

    // Auto-block pending users after 30 minutes of first login
    if (user.status === 'pending' && user.firstLoginAt) {
      const thirtyMinutes = 30 * 60 * 1000;
      const timePassed = new Date() - new Date(user.firstLoginAt);
      
      if (timePassed > thirtyMinutes) {
        console.log(`Auto-blocking user ${user.email} after 30 minutes pending.`);
        user.status = 'blocked';
        await user.save();
        return res.status(403).json({ 
          success: false, 
          message: 'Your account has been automatically suspended because it was not approved within 30 minutes of login.',
          statusCode: 'BLOCKED'
        });
      }
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// Middleware that requires the user to be approved (status === 'approved')
// Apply this to all data endpoints. Do NOT apply to /api/auth/me so pending users can poll their status.
exports.requireApproved = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated.' });

  if (req.user.status === 'blocked') {
    return res.status(403).json({ success: false, message: 'Your account has been suspended.', statusCode: 'BLOCKED' });
  }
  if (req.user.status === 'pending') {
    return res.status(403).json({ success: false, message: 'Your account is pending approval.', statusCode: 'PENDING' });
  }
  // approved or admin — allow through
  next();
};

exports.requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
  }
  next();
};

exports.requireSupplier = (req, res, next) => {
  if (!req.user || (req.user.role !== 'supplier' && req.user.role !== 'admin')) {
    return res.status(403).json({ success: false, message: 'Access denied. Supplier role required.' });
  }
  next();
};

exports.signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};
