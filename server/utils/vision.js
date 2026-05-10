const tf = require('@tensorflow/tfjs');
const mobilenet = require('@tensorflow-models/mobilenet');
const axios = require('axios');
const jpeg = require('jpeg-js');
const { PNG } = require('pngjs');

let model = null;

/**
 * Load the MobileNet model (singleton)
 */
async function loadModel() {
  if (!model) {
    console.log('--- Loading MobileNet Model (Pure JS) ---');
    model = await mobilenet.load({
      version: 1,
      alpha: 1.0
    });
    console.log('--- MobileNet Model Loaded ---');
  }
  return model;
}

/**
 * Decode image buffer to tensor (Supports JPEG and PNG)
 */
function decodeImage(buffer) {
  // Check if it's a PNG by looking at the first 8 bytes
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
  
  let pixels, width, height;

  if (isPng) {
    const png = PNG.sync.read(buffer);
    pixels = png.data;
    width = png.width;
    height = png.height;
  } else {
    // Assume JPEG
    const decoded = jpeg.decode(buffer, true);
    pixels = decoded.data;
    width = decoded.width;
    height = decoded.height;
  }
  
  // Convert RGBA to RGB
  const bufferRGB = new Float32Array(width * height * 3);
  for (let i = 0; i < width * height; i++) {
    bufferRGB[i * 3] = pixels[i * 4];     // R
    bufferRGB[i * 3 + 1] = pixels[i * 4 + 1]; // G
    bufferRGB[i * 3 + 2] = pixels[i * 4 + 2]; // B
  }
  
  return tf.tensor3d(bufferRGB, [height, width, 3]);
}

/**
 * Generate embedding for an image URL
 */
async function generateEmbedding(imageUrl) {
  try {
    const activeModel = await loadModel();
    
    // Fetch image
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);
    
    // Decode image to tensor
    const imageTensor = decodeImage(imageBuffer);
    
    // Preprocess (MobileNet expects 224x224)
    const resized = tf.image.resizeBilinear(imageTensor, [224, 224]);
    const expanded = resized.expandDims(0);
    const normalized = expanded.toFloat().div(tf.scalar(127.5)).sub(tf.scalar(1.0));
    
    // Generate embedding
    const embedding = activeModel.infer(normalized, true);
    const embeddingArray = await embedding.array();
    
    // Cleanup
    imageTensor.dispose();
    resized.dispose();
    expanded.dispose();
    normalized.dispose();
    embedding.dispose();
    
    return embeddingArray[0];
  } catch (err) {
    console.error('Error generating embedding:', err);
    return null;
  }
}

module.exports = {
  loadModel,
  generateEmbedding,
  decodeImage
};
