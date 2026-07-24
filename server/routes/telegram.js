/**
 * Telegram Integration Routes
 * POST /connect-telegram — kick off channel sync
 * GET  /telegram-sync-status — poll sync progress
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const Store = require('../models/Store');
const Product = require('../models/Product');
const { requireSupplier } = require('../middleware/auth');
const { cloudinary } = require('../config/cloudinary');
const { parseCaptionWithClaude } = require('../utils/claude');

const TELEGRAM_SERVICE_URL = process.env.TELEGRAM_SERVICE_URL || 'http://localhost:5001';
const SYNC_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Upload a base64 image to Cloudinary
 * @param {string} base64Data — raw base64 image string (no data URI prefix)
 * @returns {Promise<{url: string, publicId: string}>}
 */
async function uploadBase64ToCloudinary(base64Data) {
  const result = await cloudinary.uploader.upload(
    `data:image/jpeg;base64,${base64Data}`,
    {
      folder: 'choufliya/products',
      transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto:good' }],
    }
  );
  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

/**
 * Background sync pipeline — runs after the HTTP response is sent.
 * Fetches channel messages from Python service, parses captions with Claude,
 * uploads images to Cloudinary, and upserts products in MongoDB.
 */
async function runSyncPipeline(store, channelUsername) {
  const storeId = store._id;
  try {
    // Update status to syncing (atomic)
    await Store.findByIdAndUpdate(storeId, {
      telegramSyncStatus: 'syncing',
      telegramSyncProgress: 0,
      telegramSyncError: '',
    });

    // 1. Call Python service to fetch channel messages
    console.log(`📡 Fetching messages from ${channelUsername}...`);
    let fetchResponse;
    try {
      fetchResponse = await axios.post(
        `${TELEGRAM_SERVICE_URL}/fetch-channel`,
        { channel: channelUsername },
        { timeout: 300000 } // 5 minutes max for large channels
      );
    } catch (err) {
      const errData = err.response?.data;
      const errCode = errData?.code || 'FETCH_ERROR';
      const errMsg = errData?.error || err.message;

      await Store.findByIdAndUpdate(storeId, {
        telegramSyncStatus: 'failed',
        telegramSyncError: errCode === 'CHANNEL_PRIVATE'
          ? 'Channel is private. Make it public or add our bot as admin.'
          : errCode === 'CHANNEL_NOT_FOUND'
            ? 'Channel not found. Check the username and try again.'
            : `Fetch failed: ${errMsg}`,
      });
      return;
    }

    const messages = fetchResponse.data.messages || [];
    const channelInfo = fetchResponse.data.channel_info || {};
    console.log(`Received ${messages.length} messages from ${channelUsername}`);

    // Update store with real channel metadata (atomic)
    const metaUpdate = {
      telegramHandle: channelUsername.replace(/^@/, ''),
      telegramLink: `https://t.me/${channelUsername.replace(/^@/, '')}`,
    };
    if (channelInfo.title) metaUpdate.name = channelInfo.title;
    if (channelInfo.about) metaUpdate.description = channelInfo.about;
    if (channelInfo.subscribers != null) metaUpdate.followerCount = channelInfo.subscribers;

    // Upload channel avatar to Cloudinary if available
    if (channelInfo.avatar_base64) {
      try {
        const avatarResult = await cloudinary.uploader.upload(
          `data:image/jpeg;base64,${channelInfo.avatar_base64}`,
          { folder: 'choufliya/avatars', transformation: [{ width: 200, height: 200, crop: 'fill' }] }
        );
        metaUpdate.avatar = avatarResult.secure_url;
        metaUpdate.avatarPublicId = avatarResult.public_id;
        console.log('Channel avatar uploaded to Cloudinary');
      } catch (avatarErr) {
        console.error('Failed to upload channel avatar:', avatarErr.message);
      }
    }
    await Store.findByIdAndUpdate(storeId, metaUpdate);

    if (messages.length === 0) {
      await Store.findByIdAndUpdate(storeId, {
        telegramSyncStatus: 'completed',
        telegramSyncProgress: 0,
        lastTelegramSync: new Date(),
      });
      return;
    }

    // Helper to process a single message with parallel AI parsing & Cloudinary upload
    const processSingleMessage = async (msg) => {
      try {
        const existing = await Product.findOne({
          sourceMessageId: msg.message_id,
          sourceChannel: channelUsername,
          store: storeId,
        });

        if (existing) {
          return true;
        }

        const photoResponse = await axios.post(`${TELEGRAM_SERVICE_URL}/fetch-photo`, {
          channel: channelUsername,
          message_id: msg.message_id,
        }, { timeout: 60000 });

        if (!photoResponse.data || !photoResponse.data.image_base64) {
          throw new Error(`Failed to fetch photo from python service for message ${msg.message_id}`);
        }

        // Run caption parsing and Cloudinary image upload in PARALLEL
        const [parsed, uploaded] = await Promise.all([
          parseCaptionWithClaude(msg.caption),
          uploadBase64ToCloudinary(photoResponse.data.image_base64),
        ]);

        // Generate CLIP 512-dim embedding for the uploaded Cloudinary image
        let clipEmbedding = [];
        try {
          const clipResponse = await axios.post(
            `${TELEGRAM_SERVICE_URL}/embed-image`,
            { imageUrl: uploaded.url },
            { timeout: 30000 }
          );
          if (clipResponse.data?.success && Array.isArray(clipResponse.data.embedding)) {
            clipEmbedding = clipResponse.data.embedding;
          }
        } catch (clipErr) {
          console.warn(`⚠️  CLIP embedding failed for message ${msg.message_id}: ${clipErr.message}`);
        }

        // Fetch the current store name/handle atomically (don't trust stale store object)
        const freshStore = await Store.findById(storeId).select('name handle').lean();

        await Product.create({
          store: storeId,
          storeName: freshStore?.name || '',
          storeHandle: freshStore?.handle || '',
          title: parsed.name,
          description: parsed.description,
          imageUrl: uploaded.url,
          imagePublicId: uploaded.publicId,
          price: parsed.price,
          currency: parsed.currency,
          category: parsed.category,
          subcategory: '',
          tags: [],
          isActive: true,
          source: 'telegram',
          sourceChannel: channelUsername,
          sourceMessageId: msg.message_id,
          needsReview: parsed.needsReview,
          clip_embedding: clipEmbedding,
        });

        return true;
      } catch (msgErr) {
        console.error(`⚠️  Error processing message ${msg.message_id}:`, msgErr.message);
        return false;
      }
    };

    // 2. Process messages with a concurrency worker pool (CONCURRENCY_LIMIT = 8)
    let processedCount = 0;
    const CONCURRENCY_LIMIT = 8;
    let currentIndex = 0;
    // Mutex counter for atomic progress updates
    const progressLock = { value: 0 };

    const runWorker = async () => {
      while (currentIndex < messages.length) {
        const msg = messages[currentIndex++];
        if (!msg) break;

        await processSingleMessage(msg);
        // Atomic increment using a local counter, then flush to DB periodically
        progressLock.value++;
        const localCount = progressLock.value;

        // Update progress in database every 5 products or at the end (atomic)
        if (localCount % 5 === 0 || localCount === messages.length) {
          await Store.findByIdAndUpdate(storeId, { telegramSyncProgress: localCount });
        }
      }
    };

    // Spawn concurrent workers
    const workers = [];
    const numWorkers = Math.min(CONCURRENCY_LIMIT, messages.length);
    for (let w = 0; w < numWorkers; w++) {
      workers.push(runWorker());
    }
    await Promise.all(workers);

    processedCount = progressLock.value;

    // 3. Finalize (atomic)
    const finalProductCount = await Product.countDocuments({ store: storeId, isActive: true });
    await Store.findByIdAndUpdate(storeId, {
      telegramSyncStatus: 'completed',
      telegramSyncProgress: processedCount,
      lastTelegramSync: new Date(),
      productCount: finalProductCount,
    });

    console.log(`🎉 Sync complete for ${channelUsername}: ${processedCount} products processed`);
  } catch (err) {
    console.error('❌ Sync pipeline error:', err);
    await Store.findByIdAndUpdate(storeId, {
      telegramSyncStatus: 'failed',
      telegramSyncError: err.message || 'Unexpected error during sync.',
    });
  }
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * POST /api/supplier/connect-telegram
 * Kicks off a Telegram channel sync for the authenticated supplier.
 */
router.post('/connect-telegram', requireSupplier, async (req, res) => {
  try {
    const { channelUsername } = req.body;

    if (!channelUsername) {
      return res.status(400).json({ success: false, message: 'Channel username is required.' });
    }

    // Validate format
    const cleaned = channelUsername.replace(/^@/, '').trim();
    if (!cleaned || cleaned.length < 4 || cleaned.length > 32) {
      return res.status(400).json({ success: false, message: 'Username must be 5-32 characters.' });
    }
    if (!/^[a-zA-Z][a-zA-Z0-9_]{3,31}$/.test(cleaned)) {
      return res.status(400).json({ success: false, message: 'Invalid Telegram username format.' });
    }

    const normalizedUsername = `@${cleaned}`;

    // Get the supplier's store
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    // Check if already syncing
    if (store.telegramSyncStatus === 'syncing') {
      return res.status(409).json({
        success: false,
        message: 'A sync is already in progress. Please wait for it to complete.',
      });
    }

    // Rate limit: max 1 sync per 10 minutes
    if (store.lastTelegramSync) {
      const elapsed = Date.now() - new Date(store.lastTelegramSync).getTime();
      if (elapsed < SYNC_COOLDOWN_MS) {
        const remainingMins = Math.ceil((SYNC_COOLDOWN_MS - elapsed) / 60000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${remainingMins} minute(s) before syncing again.`,
        });
      }
    }

    // Respond immediately, run sync in background
    res.json({
      success: true,
      message: 'Telegram sync started! Check status for progress.',
      syncStatus: 'syncing',
    });

    // Fire-and-forget background sync
    runSyncPipeline(store, normalizedUsername).catch(err => {
      console.error('Background sync error:', err);
    });
  } catch (err) {
    console.error('Connect telegram error:', err);
    res.status(500).json({ success: false, message: 'Error starting Telegram sync.' });
  }
});

/**
 * GET /api/supplier/telegram-sync-status
 * Returns the current sync status for the supplier's store.
 */
router.get('/telegram-sync-status', requireSupplier, async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id }).select(
      'telegramSyncStatus telegramSyncProgress telegramSyncError lastTelegramSync telegramHandle name description avatar followerCount'
    );
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    // Count telegram products for this store
    const telegramProductCount = await Product.countDocuments({
      store: store._id,
      source: 'telegram',
    });
    const needsReviewCount = await Product.countDocuments({
      store: store._id,
      source: 'telegram',
      needsReview: true,
    });

    res.json({
      success: true,
      syncStatus: store.telegramSyncStatus,
      syncProgress: store.telegramSyncProgress,
      syncError: store.telegramSyncError,
      lastSync: store.lastTelegramSync,
      telegramHandle: store.telegramHandle,
      telegramProductCount,
      needsReviewCount,
      channelName: store.name,
      channelDescription: store.description,
      channelAvatar: store.avatar,
      channelSubscribers: store.followerCount,
    });
  } catch (err) {
    console.error('Telegram sync status error:', err);
    res.status(500).json({ success: false, message: 'Error fetching sync status.' });
  }
});

module.exports = router;
