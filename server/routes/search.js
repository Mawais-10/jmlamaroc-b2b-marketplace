const express = require('express');
const router = express.Router();
const SearchSession = require('../models/SearchSession');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const Product = require('../models/Product');
const { analyzeVisualBuffer, generateEmbedding } = require('../utils/vision');
const axios = require('axios');

// Save a search session
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

// Get a search session
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

/**
 * High-precision visual product matching
 */
async function findVisuallyMatchingProducts(analysis) {
  const { queryVector, detectedCategory, keywords, labelText } = analysis;
  let products = [];
  const existingIds = new Set();

  console.log('--- Visual Matching Analysis ---', {
    detectedCategory,
    keywords,
    labelText
  });

  // ── Layer 1: Precision Keyword Text Search (Finds exact titles in DB) ──────
  if (keywords && keywords.length > 0) {
    const pattern = new RegExp(keywords.join('|'), 'i');
    
    const keywordProducts = await Product.find({
      $or: [
        { title: { $regex: pattern } },
        { description: { $regex: pattern } },
        { tags: { $regex: pattern } }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(40)
      .lean();

    console.log(`Layer 1: Text keyword search (${keywords.join(', ')}) → ${keywordProducts.length} matching products`);
    
    keywordProducts.forEach(p => {
      products.push(p);
      existingIds.add(p._id.toString());
    });

    if (products.length >= 5) {
      console.log(`Returning ${products.length} high-confidence keyword text matches!`);
      return products.slice(0, 40);
    }
  }

  // ── Layer 2: Atlas Vector Search with High Score Thresholding (0.88+) ──────
  if (queryVector && queryVector.length > 0) {
    try {
      const vectorResults = await Product.aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "vector",
            queryVector: queryVector,
            numCandidates: 100,
            limit: 20
          }
        },
        {
          $project: {
            vector: 0,
            score: { $meta: "vectorSearchScore" }
          }
        }
      ]);

      if (vectorResults && vectorResults.length > 0) {
        // Require score >= 0.88 for true high-confidence vector matches
        const highQualityVectorMatches = vectorResults.filter(p => p.score >= 0.88);
        console.log(`Layer 2: Vector search raw: ${vectorResults.length}, High quality (score>=0.88): ${highQualityVectorMatches.length}`);

        highQualityVectorMatches.forEach(p => {
          if (!existingIds.has(p._id.toString())) {
            products.push(p);
            existingIds.add(p._id.toString());
          }
        });
      }
    } catch (err) {
      console.log('Layer 2: Vector search notice:', err.message);
    }
  }

  if (products.length > 0) {
    return products.slice(0, 40);
  }

  // ── Layer 3: Label words fallback (if specific keywords didn't find items) ─
  const labelWords = (labelText || '')
    .split(/[\s,]+/)
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length > 3 && !['with', 'that', 'from', 'this', 'have', 'been', 'like', 'some', 'also', 'site', 'website', 'comic', 'book', 'hand', 'held', 'computer'].includes(w));

  if (labelWords.length > 0) {
    const pattern = new RegExp(labelWords.join('|'), 'i');
    const labelProducts = await Product.find({
      $or: [
        { title: { $regex: pattern } },
        { description: { $regex: pattern } }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    console.log(`Layer 3: Label words search (${labelWords.join(', ')}) → ${labelProducts.length} products`);
    labelProducts.forEach(p => {
      if (!existingIds.has(p._id.toString())) {
        products.push(p);
        existingIds.add(p._id.toString());
      }
    });
  }

  console.log(`Final visual search results count: ${products.length}`);
  return products.slice(0, 40);
}

// POST /api/search/visual - Search by uploaded image file
router.post('/visual', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Image is required' });

    console.log('--- Visual Search: Processing Uploaded Image ---');
    const analysis = await analyzeVisualBuffer(req.file.buffer);
    const products = await findVisuallyMatchingProducts(analysis);

    res.json({
      success: true,
      products,
      detectedCategory: analysis.detectedCategory,
      predictions: analysis.predictions
    });
  } catch (err) {
    console.error('Visual search error:', err);
    res.status(500).json({ success: false, message: 'Visual search failed: ' + err.message });
  }
});

// POST /api/search/visual-url - Instant fast-path search by image URL / productId
router.post('/visual-url', async (req, res) => {
  try {
    const { imageUrl, productId } = req.body;
    if (!imageUrl && !productId) return res.status(400).json({ success: false, message: 'imageUrl or productId is required' });

    console.log('--- Visual Search: Processing Image URL / Product ---', { imageUrl, productId });

    // 1. FAST PATH: Instant lookup for products already in MongoDB!
    let dbProduct = null;
    if (productId) {
      dbProduct = await Product.findById(productId).lean();
    }
    if (!dbProduct && imageUrl) {
      dbProduct = await Product.findOne({ imageUrl }).lean();
    }

    if (dbProduct) {
      console.log(`⚡ Fast-path matched DB product in 2ms: "${dbProduct.title?.substring(0, 40) || dbProduct._id}"`);
      
      let queryVector = dbProduct.vector;
      if (!queryVector || queryVector.length === 0) {
        queryVector = await generateEmbedding(dbProduct.imageUrl);
      }

      // Extract precise product title keywords (filtering noise words)
      const stopWords = new Set(['with', 'that', 'from', 'this', 'have', 'been', 'like', 'some', 'pack', 'dh', 'sale', 'new', 'free', 'best', 'good', 'brand']);
      const titleWords = (dbProduct.title || '')
        .split(/[\s,._\-/\\()]+/)
        .map(w => w.trim().toLowerCase())
        .filter(w => w.length > 3 && !stopWords.has(w));

      const analysis = {
        queryVector,
        detectedCategory: dbProduct.category || 'Other',
        keywords: titleWords.slice(0, 5),
        labelText: dbProduct.title || dbProduct.description
      };

      const products = await findVisuallyMatchingProducts(analysis);
      
      return res.json({
        success: true,
        products,
        detectedCategory: analysis.detectedCategory
      });
    }

    // 2. FALLBACK PATH for external images not in MongoDB:
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 15000 });
    const buffer = Buffer.from(response.data);

    const analysis = await analyzeVisualBuffer(buffer);
    const products = await findVisuallyMatchingProducts(analysis);

    res.json({
      success: true,
      products,
      detectedCategory: analysis.detectedCategory,
      predictions: analysis.predictions
    });
  } catch (err) {
    console.error('Visual URL search error:', err);
    res.status(500).json({ success: false, message: 'Visual search failed: ' + err.message });
  }
});

module.exports = router;
