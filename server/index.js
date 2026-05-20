require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const storeRoutes = require('./routes/stores');
const productRoutes = require('./routes/products');
const supplierRoutes = require('./routes/supplier');
const adminRoutes = require('./routes/admin');
const searchRoutes = require('./routes/search');
const notificationRoutes = require('./routes/notifications');
const supportRoutes = require('./routes/support');
const collectionRoutes = require('./routes/collections');
const { protect, requireApproved } = require('./middleware/auth');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// CORS - allow both frontend and admin panel
const allowedOrigins = [
  // Production
  'https://wayzo.net',
  'https://www.wayzo.net',
  'https://api.wayzo.net',
  // From env (for flexibility)
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  // Development only
  ...(!isProduction ? [
    'http://localhost:3000',
    'http://localhost:4000',
    'http://localhost:5173', // Vite default
  ] : []),
].filter(Boolean); // remove undefined entries

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logger (condensed in production)
app.use((req, _res, next) => {
  if (!isProduction) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stores', protect, requireApproved, storeRoutes);
app.use('/api/products', protect, requireApproved, productRoutes);
app.use('/api/supplier', protect, requireApproved, supplierRoutes);
app.use('/api/admin', adminRoutes); // adminRoutes already has its own protection
app.use('/api/search', protect, requireApproved, searchRoutes);
app.use('/api/notifications', protect, requireApproved, notificationRoutes);
app.use('/api/support', protect, requireApproved, supportRoutes);
app.use('/api/collections', protect, requireApproved, collectionRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'OK',
    message: '🚀 ChouFliya API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date(),
  });
});

// ─── Serve Frontend in Production ────────────────────────────────────────────
if (isProduction) {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));

  // Catch-all: serve index.html for any non-API route (SPA client-side routing)
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ success: false, message: 'Route not found.' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // 404 handler for dev (frontend served by Vite dev server)
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found.' });
  });
}

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: isProduction ? 'Internal server error.' : err.message });
});

// Connect to MongoDB then start server
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`\n🚀 ChouFliya Backend running on http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    if (isProduction) {
      console.log(`📦 Serving frontend from: ../dist`);
    }
    console.log(`📊 Admin API: http://localhost:${PORT}/api/admin`);
    console.log(`🩺 Health:   http://localhost:${PORT}/api/health\n`);
  });
});
