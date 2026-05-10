require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const storeRoutes = require('./routes/stores');
const productRoutes = require('./routes/products');
const supplierRoutes = require('./routes/supplier');
const adminRoutes = require('./routes/admin');
const searchRoutes = require('./routes/search');
const notificationRoutes = require('./routes/notifications');
const supportRoutes = require('./routes/support');

const app = express();

// CORS - allow both frontend and admin panel
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  process.env.ADMIN_URL || 'http://localhost:4000',
  'http://localhost:3000',
  'http://localhost:4000',
  'http://localhost:5173', // Vite default
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/support', supportRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, status: 'OK', message: '🚀 ChouFliya API is running', timestamp: new Date() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
});

// Connect to MongoDB then start server
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`\n🚀 ChouFliya Backend running on http://localhost:${PORT}`);
    console.log(`📊 Admin API: http://localhost:${PORT}/api/admin`);
    console.log(`🩺 Health:   http://localhost:${PORT}/api/health\n`);
  });
});
