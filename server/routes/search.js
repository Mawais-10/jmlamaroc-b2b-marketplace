const express = require('express');
const router = express.Router();
const SearchSession = require('../models/SearchSession');
const { v4: uuidv4 } = require('uuid');

// Save a search session
router.post('/sessions', async (req, res) => {
  try {
    const { filters } = req.body;
    // Generate a short ID (8 chars)
    const sessionId = uuidv4().split('-')[0];
    
    const session = new SearchSession({
      sessionId,
      filters
    });
    
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
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const Product = require('../models/Product');
const { generateEmbedding, decodeImage, loadModel } = require('../utils/vision');
const tf = require('@tensorflow/tfjs');

// POST /api/search/visual - Search by image upload
router.post('/visual', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Image is required' });

    // 1. Generate embedding from buffer
    const imageTensor = decodeImage(req.file.buffer);
    const resized = tf.image.resizeBilinear(imageTensor, [224, 224]);
    const expanded = resized.expandDims(0);
    const normalized = expanded.toFloat().div(tf.scalar(127.5)).sub(tf.scalar(1.0));
    
    const model = await loadModel();
    const embedding = model.infer(normalized, true);
    const queryVector = (await embedding.array())[0];

    // Cleanup tensors
    imageTensor.dispose();
    resized.dispose();
    expanded.dispose();
    normalized.dispose();
    embedding.dispose();

    // 2. MongoDB Atlas Vector Search
    const results = await Product.aggregate([
      {
        $vectorSearch: {
          index: "vector_index", 
          path: "vector",
          queryVector: queryVector,
          numCandidates: 100,
          limit: 10
        }
      },
      {
        $project: {
          vector: 0, 
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]);

    res.json({ success: true, products: results });
  } catch (err) {
    console.error('Visual search error:', err);
    res.status(500).json({ success: false, message: 'Visual search failed' });
  }
});

// POST /api/search/visual-url - Search by image URL
router.post('/visual-url', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ success: false, message: 'imageUrl is required' });

    // 1. Generate embedding using utility
    const queryVector = await generateEmbedding(imageUrl);
    if (!queryVector) return res.status(500).json({ success: false, message: 'Failed to generate visual fingerprint' });

    // 2. MongoDB Atlas Vector Search
    const results = await Product.aggregate([
      {
        $vectorSearch: {
          index: "vector_index", 
          path: "vector",
          queryVector: queryVector,
          numCandidates: 100,
          limit: 10
        }
      },
      {
        $project: {
          vector: 0, 
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]);

    res.json({ success: true, products: results });
  } catch (err) {
    console.error('Visual URL search error:', err);
    res.status(500).json({ success: false, message: 'Visual search failed' });
  }
});

module.exports = router;
