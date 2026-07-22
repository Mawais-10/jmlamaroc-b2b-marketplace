const tf = require('@tensorflow/tfjs');
const mobilenet = require('@tensorflow-models/mobilenet');
const axios = require('axios');
const jpeg = require('jpeg-js');
const { PNG } = require('pngjs');

let model = null;

async function loadModel() {
  if (!model) {
    console.log('--- Loading MobileNet Model ---');
    model = await mobilenet.load({ version: 1, alpha: 1.0 });
    console.log('--- MobileNet Model Loaded ---');
  }
  return model;
}

function decodeImage(buffer) {
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;

  let pixels, width, height;

  if (isPng) {
    const png = PNG.sync.read(buffer);
    pixels = png.data;
    width = png.width;
    height = png.height;
  } else {
    const decoded = jpeg.decode(buffer, true);
    pixels = decoded.data;
    width = decoded.width;
    height = decoded.height;
  }

  const bufferRGB = new Float32Array(width * height * 3);
  for (let i = 0; i < width * height; i++) {
    bufferRGB[i * 3]     = pixels[i * 4];     // R
    bufferRGB[i * 3 + 1] = pixels[i * 4 + 1]; // G
    bufferRGB[i * 3 + 2] = pixels[i * 4 + 2]; // B
  }

  return tf.tensor3d(bufferRGB, [height, width, 3]);
}

/**
 * Filter predictions to extract high-precision product keywords across ALL categories
 * STRICT WORD BOUNDARY CHECKING (prevents "microphone" from matching "phone"!)
 */
function classifyVisualConcepts(predictions) {
  const labelText = predictions.map(p => p.className.toLowerCase()).join(' ');
  console.log('MobileNet raw predictions:', predictions.map(p => `${p.className} (${(p.probability*100).toFixed(1)}%)`).join(', '));

  let detectedCategory = null;
  const specificKeywords = new Set();

  // Clean tokens from raw MobileNet predictions
  const labelTokens = new Set(
    labelText
      .split(/[\s,._\-/\\()]+/)
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 2)
  );

  // Stop-words to ignore
  const stopWords = new Set([
    'site', 'website', 'internet', 'page', 'comic', 'book', 'hand', 'held', 'computer',
    'apron', 'spatula', 'overskirt', 'nipple', 'brassiere', 'bra', 'bandeau', 'menu',
    'vending', 'machine', 'cash', 'dispenser', 'atm', 'packet', 'lighter', 'web',
    'card', 'paper', 'tissue', 'toilet', 'box', 'case', 'cover', 'wrapper', 'picture',
    'frame', 'screen', 'monitor', 'product', 'item', 'thing', 'good', 'quality'
  ]);

  // Extract raw label words (probability > 0.05) if not in stopWords
  for (const pred of predictions) {
    if (pred.probability < 0.05) continue;
    const words = pred.className.toLowerCase().split(/[\s,/\\_-]+/);
    for (const w of words) {
      const clean = w.trim();
      if (clean.length > 3 && !stopWords.has(clean)) {
        specificKeywords.add(clean);
      }
    }
  }

  // Category Detection Rules with STRICT FULL-WORD EQUALITY matching
  const rules = [
    {
      pattern: /\blotion\b|\bcream\b|\bmoisturizer\b|\bsunscreen\b|\bserum\b|\btoner\b|\bsoap\b|\bshampoo\b|\bconditioner\b|\bperfume\b|\bcologne\b|\bfragrance\b|\blipstick\b|\bmakeup\b|\bfoundation\b|\bmascara\b|\bblush\b|\beyeliner\b|\bcosmetic\b|\bskincare\b|\bcleanser\b/,
      category: 'Beauty',
      exactTerms: ['lotion', 'cream', 'serum', 'snail', 'collagen', 'skincare', 'perfume', 'makeup', 'soap', 'مكياج', 'كريم', 'سيروم', 'عطر', 'صابون', 'بشرة']
    },
    {
      pattern: /\bmicrophone\b|\bmike\b|\bspeaker\b|\bradio\b|\bheadphone\b|\bearphone\b|\baudio\b/,
      category: 'Electronics',
      exactTerms: ['microphone', 'mic', 'mike', 'speaker', 'radio', 'headphone', 'ميكروفون', 'مايك', 'سماعة', 'صوت']
    },
    {
      pattern: /\bwatch\b|\bclock\b|\bwristwatch\b|\bstopwatch\b/,
      category: 'Electronics',
      exactTerms: ['watch', 'smartwatch', 'clock', 'ساعة']
    },
    {
      pattern: /\bphone\b|\bsmartphone\b|\bcellular\b|\bmobile\b/,
      category: 'Electronics',
      exactTerms: ['phone', 'smartphone', 'mobile', 'هاتف', 'جوال']
    },
    {
      pattern: /\blaptop\b|\btablet\b|\bcamera\b|\bremote\b|\bgadget\b|\bbluetooth\b|\bfan\b|\bheater\b|\bbulb\b|\blamp\b|\blight\b|\bled\b|\bsolar\b/,
      category: 'Electronics',
      exactTerms: ['bluetooth', 'camera', 'fan', 'lamp', 'light', 'solar', 'led', 'كاميرا', 'مروحة', 'مصباح', 'إنارة']
    },
    {
      pattern: /\bbag\b|\bhandbag\b|\bpurse\b|\bbackpack\b|\bknapsack\b|\brucksack\b|\bsuitcase\b|\bluggage\b|\bwallet\b|\bbriefcase\b|\btote\b|\bclutch\b|\bpouch\b/,
      category: 'Fashion',
      exactTerms: ['bag', 'handbag', 'purse', 'backpack', 'wallet', 'sac', 'حقيبة', 'شنطة']
    },
    {
      pattern: /\bshoe\b|\bsandal\b|\bboot\b|\bheel\b|\bsneaker\b|\btrainer\b|\bloafer\b|\bclog\b|\bfootwear\b|\bslipper\b|\bstiletto\b|\bpump\b|\bpatten\b|\bsabot\b/,
      category: 'Fashion',
      exactTerms: ['shoe', 'sandal', 'boot', 'sneaker', 'footwear', 'slipper', 'حذاء', 'صندل', 'نعال']
    },
    {
      pattern: /\bshirt\b|\bt-shirt\b|\bjersey\b|\btshirt\b|\bdress\b|\bgown\b|\bskirt\b|\bsuit\b|\bjacket\b|\bcoat\b|\btrouser\b|\bpant\b|\bjean\b|\bdenim\b|\bblouse\b|\bsweater\b|\bhoodie\b|\bsweatshirt\b|\bpajama\b|\bpyjama\b|\bshort\b|\bcloth\b|\bapparel\b/,
      category: 'Fashion',
      exactTerms: ['dress', 'shirt', 'jacket', 't-shirt', 'pants', 'jeans', 'pajama', 'shorts', 'فستان', 'ملابس', 'قميص', 'بنطلون', 'بيجامة']
    },
    {
      pattern: /\bnecklace\b|\bpendant\b|\bring\b|\bbracelet\b|\bearring\b|\bjewel\b|\bdiamond\b|\bgold\b|\bsilver\b|\bbangle\b/,
      category: 'Fashion',
      exactTerms: ['jewelry', 'necklace', 'ring', 'bracelet', 'gold', 'مجوهرات', 'خاتم', 'سلسلة']
    },
    {
      pattern: /\brack\b|\bshelf\b|\borganizer\b|\bstorage\b|\bchair\b|\btable\b|\bdesk\b|\bsofa\b|\bbed\b|\bmat\b|\btowel\b|\bcurtain\b|\bholder\b|\bhanger\b|\bstand\b/,
      category: 'Home Decor',
      exactTerms: ['rack', 'shelf', 'organizer', 'storage', 'holder', 'chair', 'رف', 'منظم', 'حامل', 'كرسي']
    },
    {
      pattern: /\bpan\b|\bpot\b|\bknife\b|\bfork\b|\bspoon\b|\bbowl\b|\bplate\b|\bcup\b|\bmug\b|\bkettle\b|\bblender\b|\btoaster\b|\bcookware\b|\bfaucet\b|\bsink\b/,
      category: 'Kitchen Tools',
      exactTerms: ['kitchen', 'pan', 'pot', 'blender', 'kettle', 'faucet', 'مطبخ', 'خلاط', 'إبريق', 'صنبور']
    },
    {
      pattern: /\bcar\b|\bauto\b|\bbumper\b|\btire\b|\bwheel\b|\bseat\b|\bhose\b|\bwasher\b|\btool\b|\bdrill\b|\bsaw\b|\brepair\b/,
      category: 'Automotive',
      exactTerms: ['car', 'auto', 'tool', 'washer', 'سيارة', 'أدوات', 'غسيل']
    }
  ];

  for (const rule of rules) {
    if (rule.pattern.test(labelText)) {
      detectedCategory = rule.category;
      // Add exact category specific terms ONLY if the word exists as a full token in labelText
      rule.exactTerms.forEach(term => {
        if (labelTokens.has(term.toLowerCase())) {
          specificKeywords.add(term);
        }
      });
      break;
    }
  }

  return {
    detectedCategory: detectedCategory || 'Other',
    keywords: Array.from(specificKeywords),
    labelText
  };
}

/**
 * Analyze image buffer: run MobileNet classification + generate embedding vector
 */
async function analyzeVisualBuffer(buffer) {
  const activeModel = await loadModel();
  const imageTensor = decodeImage(buffer);

  const resized = tf.image.resizeBilinear(imageTensor, [224, 224]);
  const expanded = resized.expandDims(0);
  const normalized = expanded.toFloat().div(tf.scalar(127.5)).sub(tf.scalar(1.0));

  // Run classification + embedding in parallel
  const [predictions, embedding] = await Promise.all([
    activeModel.classify(imageTensor),
    activeModel.infer(normalized, true)
  ]);

  const queryVector = (await embedding.array())[0];

  // Cleanup tensors
  imageTensor.dispose();
  resized.dispose();
  expanded.dispose();
  normalized.dispose();
  embedding.dispose();

  const { detectedCategory, keywords, labelText } = classifyVisualConcepts(predictions);

  return { queryVector, predictions, detectedCategory, keywords, labelText };
}

/**
 * Generate embedding for an image URL
 */
async function generateEmbedding(imageUrl) {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 15000 });
    const buffer = Buffer.from(response.data);
    const analysis = await analyzeVisualBuffer(buffer);
    return analysis.queryVector;
  } catch (err) {
    console.error('Error generating embedding:', err.message);
    return null;
  }
}

module.exports = { loadModel, generateEmbedding, decodeImage, analyzeVisualBuffer };
