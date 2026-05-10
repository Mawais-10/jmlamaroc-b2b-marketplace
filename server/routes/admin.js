const express = require('express');
const router = express.Router();
const SupplierRequest = require('../models/SupplierRequest');
const Store = require('../models/Store');
const Product = require('../models/Product');
const User = require('../models/User');
const Notification = require('../models/Notification');
const SupportTicket = require('../models/SupportTicket');
const { protect, requireAdmin } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect, requireAdmin);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalStores, totalProducts, pendingRequests, buyers, suppliers] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Store.countDocuments({ isApproved: true }),
      Product.countDocuments({ isActive: true }),
      SupplierRequest.countDocuments({ status: 'pending' }),
      User.countDocuments({ role: 'buyer', isActive: true }),
      User.countDocuments({ role: 'supplier', isActive: true }),
    ]);

    res.json({ success: true, stats: { totalUsers, totalStores, totalProducts, pendingRequests, buyers, suppliers } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching stats.' });
  }
});

// GET /api/admin/supplier-requests
router.get('/supplier-requests', async (req, res) => {
  try {
    const { status } = req.query;
    const query = status && status !== 'all' ? { status } : {};
    const requests = await SupplierRequest.find(query)
      .populate('user', 'name email avatar createdAt')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching requests.' });
  }
});

// PUT /api/admin/supplier-requests/:id/approve
router.put('/supplier-requests/:id/approve', async (req, res) => {
  try {
    const request = await SupplierRequest.findById(req.params.id).populate('user');
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });
    if (request.status === 'approved') return res.status(400).json({ success: false, message: 'Already approved.' });

    // Create the store
    const store = await Store.create({
      name: request.businessName,
      handle: request.storeHandle,
      description: request.description || '',
      categories: [request.category],
      city: request.city,
      telegramHandle: request.telegramHandle || '',
      telegramLink: request.telegramHandle ? `https://t.me/${request.telegramHandle.replace('@', '')}` : '',
      whatsappNumber: request.whatsappNumber,
      whatsappLink: `https://wa.me/${request.whatsappNumber.replace(/\D/g, '')}`,
      owner: request.user._id,
      isApproved: true,
    });

    // Update user role
    await User.findByIdAndUpdate(request.user._id, { role: 'supplier', storeId: store._id });

    // Update request status
    request.status = 'approved';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    request.storeCreated = store._id;
    await request.save();

    // Create Notification
    await Notification.create({
      recipient: request.user._id,
      title: 'Store Approved! 🚀',
      message: `Congratulations! Your store "${store.name}" has been approved. You can now start adding products.`,
      type: 'success',
      link: `/groups/${store.handle}`
    });

    res.json({ success: true, message: `Supplier approved! Store "${store.name}" created.`, store });
  } catch (err) {
    console.error('Approve supplier error:', err);
    res.status(500).json({ success: false, message: 'Error approving supplier request.' });
  }
});

// PUT /api/admin/supplier-requests/:id/reject
router.put('/supplier-requests/:id/reject', async (req, res) => {
  try {
    const { reason = '' } = req.body;
    const request = await SupplierRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });

    request.status = 'rejected';
    request.adminNote = reason;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    // Create Notification
    await Notification.create({
      recipient: request.user,
      title: 'Store Request Update',
      message: `Your supplier request was rejected. Reason: ${reason || 'No specific reason provided.'}`,
      type: 'error'
    });

    res.json({ success: true, message: 'Request rejected.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error rejecting request.' });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };
    if (role && role !== 'all') query.role = role;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);
    res.json({ success: true, users, total });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching users.' });
  }
});

// PUT /api/admin/users/:id/deactivate
router.put('/users/:id/deactivate', async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) return res.status(400).json({ success: false, message: 'Cannot deactivate your own account.' });
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'User deactivated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deactivating user.' });
  }
});

// GET /api/admin/stores
router.get('/stores', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { handle: { $regex: search, $options: 'i' } },
    ];

    const stores = await Store.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Store.countDocuments(query);
    res.json({ success: true, stores, total });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching stores.' });
  }
});

// PUT /api/admin/stores/:id/toggle
router.put('/stores/:id/toggle', async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ success: false, message: 'Store not found.' });
    store.isApproved = !store.isApproved;
    await store.save();
    res.json({ success: true, store, message: `Store ${store.isApproved ? 'activated' : 'deactivated'}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error toggling store.' });
  }
});

// DELETE /api/admin/stores/:id
router.delete('/stores/:id', async (req, res) => {
  try {
    const store = await Store.findByIdAndDelete(req.params.id);
    if (!store) return res.status(404).json({ success: false, message: 'Store not found.' });
    await Product.deleteMany({ store: req.params.id });
    res.json({ success: true, message: 'Store and its products deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting store.' });
  }
});

// GET /api/admin/products
router.get('/products', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) query.$or = [
      { description: { $regex: search, $options: 'i' } },
      { storeName: { $regex: search, $options: 'i' } },
    ];

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);
    res.json({ success: true, products, total });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching products.' });
  }
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (product) {
      // Find the store owner to notify them
      const store = await Store.findById(product.store);
      if (store) {
        await Notification.create({
          recipient: store.owner,
          title: 'Product Removed',
          message: `Your product "${product.description || 'Unnamed item'}" was removed by an administrator.`,
          type: 'warning'
        });
      }
    }
    res.json({ success: true, message: 'Product deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting product.' });
  }
});

// GET /api/admin/support-tickets
router.get('/support-tickets', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status && status !== 'all' ? { status } : {};
    
    const tickets = await SupportTicket.find(query)
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
      
    const total = await SupportTicket.countDocuments(query);
    res.json({ success: true, tickets, total });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching support tickets.' });
  }
});

// PUT /api/admin/support-tickets/:id/status
router.put('/support-tickets/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, { status, updatedAt: new Date() }, { new: true });
    
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });
    
    // Notify user of status change
    await Notification.create({
      recipient: ticket.user,
      title: 'Support Ticket Update',
      message: `Your ticket regarding "${ticket.subject}" status changed to: ${status}.`,
      type: 'info'
    });
    
    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating ticket status.' });
  }
});

module.exports = router;
