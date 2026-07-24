const express = require('express');
const router = express.Router();
const SearchSession = require('../models/SearchSession');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const Product = require('../models/Product');
const axios = require('axios');

const FLASK_SERVICE_URL = process.env.TELEGRAM_SERVICE_URL || 'http://localhost:5002';

// ─── Search Sessions ──────────────────────────────────────────────────────────

router.post('/sessions', async (req, res) => {
  try {
    const { filters } = req.body;
    const sessionId = uuidv4().split('-')[0];
    const session = new SearchSession({ sessionId, filters });
    await session.save();
    res.json({ sessionId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/sessions/:id', async (req, res) => {
  try {
    const session = await SearchSession.findOne({ sessionId: req.params.id });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── CLIP Helper Functions ────────────────────────────────────────────────────

/**
 * Call Flask /embed-image to get a 512-dim CLIP vector from a Cloudinary URL.
 * Returns null if Flask is unavailable or the call fails.
 */
async function getClipImageEmbedding(imageUrl) {
  try {
    const resp = await axios.post(
      `${FLASK_SERVICE_URL}/embed-image`,
      { imageUrl },
      { timeout: 30000 }
    );
    if (resp.data?.success && Array.isArray(resp.data.embedding)) {
      return resp.data.embedding;
    }
    return null;
  } catch (err) {
    console.warn('Flask /embed-image error:', err.message);
    return null;
  }
}

/**
 * Call Flask /embed-image with a raw image buffer (multipart upload).
 * Uploads the buffer as a temp Cloudinary URL via base64 to Flask.
 * Since Flask /embed-image expects a URL, we send the buffer as base64 data URI.
 */
async function getClipImageEmbeddingFromBuffer(buffer) {
  try {
    const base64 = buffer.toString('base64');
    // Use a data URI — Flask PIL can open it
    const dataUri = `data:image/jpeg;base64,${base64}`;
    const resp = await axios.post(
      `${FLASK_SERVICE_URL}/embed-image`,
      { imageUrl: dataUri },
      { timeout: 30000 }
    );
    if (resp.data?.success && Array.isArray(resp.data.embedding)) {
      return resp.data.embedding;
    }
    return null;
  } catch (err) {
    console.warn('Flask /embed-image (buffer) error:', err.message);
    return null;
  }
}

/**
 * Call Flask /embed-text to get a 512-dim CLIP vector from a text query.
 * Returns null if Flask is unavailable or the call fails.
 */
async function getClipTextEmbedding(text) {
  try {
    const resp = await axios.post(
      `${FLASK_SERVICE_URL}/embed-text`,
      { text },
      { timeout: 30000 }
    );
    if (resp.data?.success && Array.isArray(resp.data.embedding)) {
      return resp.data.embedding;
    }
    return null;
  } catch (err) {
    console.warn('Flask /embed-text error:', err.message);
    return null;
  }
}

// ─── Core Visual Search Logic ─────────────────────────────────────────────────

/**
 * Run MongoDB Atlas Vector Search using a 512-dim CLIP query vector.
 * Falls back to keyword-based search if queryVector is null.
 */
async function findProductsByVector(queryVector, { keywords = [], category = '', limit = 40, excludeId = null } = {}) {
  const results = [];
  const seenIds = new Set();

  // ── Layer 1: Text keyword search (fast, uses MongoDB text index) ─────────
  if (keywords.length > 0) {
    const pattern = new RegExp(
      keywords
        .filter(w => w.length > 2)
        .slice(0, 6)
        .join('|'),
      'i'
    );

    const kwProducts = await Product.find({
      $or: [
        { title: { $regex: pattern } },
        { description: { $regex: pattern } },
        { tags: { $regex: pattern } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    console.log(`Layer 1 keyword search (${keywords.join(', ')}) → ${kwProducts.length} results`);

    for (const p of kwProducts) {
      const id = p._id.toString();
      if (!seenIds.has(id) && id !== excludeId) {
        results.push(p);
        seenIds.add(id);
      }
    }
    // Note: always continue to vector search — CLIP adds semantic matches keyword search misses
  }

  // ── Layer 2: CLIP Atlas $vectorSearch on clip_embedding (cosine, 512-dim) ─
  if (queryVector && queryVector.length === 512) {
    try {
      const vectorResults = await Product.aggregate([
        {
          $vectorSearch: {
            index: 'clip_vector_index',
            path: 'clip_embedding',
            queryVector,
            numCandidates: 150,
            limit: 50,
          },
        },
        {
          $project: {
            clip_embedding: 0,   // exclude large vector from response
            vector: 0,            // exclude legacy MobileNet vector
            title: 1,
            description: 1,
            imageUrl: 1,
            imagePublicId: 1,
            price: 1,
            currency: 1,
            category: 1,
            subcategory: 1,
            tags: 1,
            store: 1,
            storeName: 1,
            storeHandle: 1,
            isActive: 1,
            views: 1,
            favoriteCount: 1,
            source: 1,
            createdAt: 1,
            score: { $meta: 'vectorSearchScore' },  // Atlas cosine similarity score
          },
        },
      ]);

      // Filter by score threshold (cosine ≥ 0.18 is meaningful for CLIP cross-modal)
      const goodMatches = vectorResults.filter(p => p.score >= 0.18);
      console.log(`Layer 2 CLIP vectorSearch → raw: ${vectorResults.length}, good (≥0.18): ${goodMatches.length}`);

      for (const p of goodMatches) {
        const id = p._id.toString();
        if (!seenIds.has(id) && id !== excludeId) {
          results.push(p);
          seenIds.add(id);
        }
      }
    } catch (err) {
      console.warn('Atlas vectorSearch error (clip_vector_index):', err.message);
    }
  }

  console.log(`Final visual search result count: ${results.length}`);
  return results.slice(0, limit);
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * POST /api/search/visual
 * Accepts a multipart image file upload.
 * Calls Flask /embed-image to get a 512-dim CLIP vector, then runs Atlas vectorSearch.
 */
router.post('/visual', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Image is required' });

    console.log('--- Visual Search: Processing Uploaded Image Buffer ---');

    // Get CLIP embedding from uploaded file buffer
    const queryVector = await getClipImageEmbeddingFromBuffer(req.file.buffer);
    if (!queryVector) {
      return res.status(503).json({ success: false, message: 'CLIP embedding service unavailable. Make sure Flask service is running.' });
    }

    const products = await findProductsByVector(queryVector);

    res.json({ success: true, products, detectedCategory: '' });
  } catch (err) {
    console.error('Visual search error:', err);
    res.status(500).json({ success: false, message: 'Visual search failed: ' + err.message });
  }
});

/**
 * POST /api/search/visual-url
 * Accepts { imageUrl, productId }.
 * Fast-path: if productId given, use stored clip_embedding from MongoDB (instant).
 * Fallback: call Flask /embed-image with the imageUrl.
 */
router.post('/visual-url', async (req, res) => {
  try {
    const { imageUrl, productId } = req.body;
    if (!imageUrl && !productId) {
      return res.status(400).json({ success: false, message: 'imageUrl or productId is required' });
    }

    console.log('--- Visual Search: Image URL / ProductId ---', { imageUrl: !!imageUrl, productId });

    let queryVector = null;
    let excludeId = null;
    let keywords = [];

    // ── Fast-path: product already in MongoDB with stored clip_embedding ─────
    let dbProduct = null;
    if (productId) {
      dbProduct = await Product.findById(productId).lean();
    }
    if (!dbProduct && imageUrl) {
      dbProduct = await Product.findOne({ imageUrl }).lean();
    }

    if (dbProduct) {
      excludeId = dbProduct._id.toString();
      console.log(`⚡ Fast-path: found DB product "${dbProduct.title?.substring(0, 40) || excludeId}"`);

      if (dbProduct.clip_embedding && dbProduct.clip_embedding.length === 512) {
        // Use stored CLIP vector — no Flask call needed!
        queryVector = dbProduct.clip_embedding;
        console.log('⚡ Using stored clip_embedding (no Flask call needed)');
      } else {
        // Product exists but has no CLIP embedding yet → call Flask
        console.log('Product found but no clip_embedding, calling Flask /embed-image...');
        queryVector = await getClipImageEmbedding(dbProduct.imageUrl);

        // Persist the embedding for future fast-path hits
        if (queryVector) {
          Product.findByIdAndUpdate(dbProduct._id, { clip_embedding: queryVector }).catch(() => {});
        }
      }

      // Extract title keywords for Layer 1 keyword search
      const stopWords = new Set(['with', 'that', 'from', 'this', 'have', 'pack', 'sale', 'new', 'free', 'best']);
      keywords = (dbProduct.title || '')
        .split(/[\s,._\-/\\()]+/)
        .map(w => w.trim().toLowerCase())
        .filter(w => w.length > 3 && !stopWords.has(w))
        .slice(0, 5);
    } else {
      // ── Fallback: external URL not in MongoDB ────────────────────────────
      console.log('Product not in DB, calling Flask /embed-image for URL...');
      queryVector = await getClipImageEmbedding(imageUrl);
    }

    if (!queryVector) {
      return res.status(503).json({ success: false, message: 'CLIP embedding service unavailable.' });
    }

    const products = await findProductsByVector(queryVector, { keywords, excludeId });

    res.json({ success: true, products, detectedCategory: dbProduct?.category || '' });
  } catch (err) {
    console.error('Visual URL search error:', err);
    res.status(500).json({ success: false, message: 'Visual search failed: ' + err.message });
  }
});

/**
 * POST /api/search/text
 * NEW endpoint — text-to-image search using CLIP.
 * Accepts { text: "red summer dress" }.
 * Calls Flask /embed-text → Atlas $vectorSearch on clip_embedding → returns products.
 */
router.post('/text', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: '"text" query is required.' });
    }

    const query = text.trim();
    console.log(`--- Text-to-Image Search: "${query}" ---`);

    const queryVector = await getClipTextEmbedding(query);
    if (!queryVector) {
      return res.status(503).json({ success: false, message: 'CLIP embedding service unavailable.' });
    }

    // Also use the text words as keyword fallback
    const keywords = query.split(/\s+/).filter(w => w.length > 2);

    const products = await findProductsByVector(queryVector, { keywords, limit: 40 });

    res.json({ success: true, products, query });
  } catch (err) {
    console.error('Text search error:', err);
    res.status(500).json({ success: false, message: 'Text search failed: ' + err.message });
  }
});

module.exports = router;
