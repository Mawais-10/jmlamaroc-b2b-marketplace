/**
 * AI Caption Parser (Google Gemini)
 * Uses the free Gemini API to parse Telegram post captions
 * into structured product data (name, price, currency, category, description).
 */

const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Parse a Telegram caption into structured product JSON using Gemini.
 * @param {string} captionText — The raw caption text from a Telegram post
 * @returns {Promise<{name: string, price: number|null, currency: string, category: string, description: string, needsReview: boolean}>}
 */
async function parseCaptionWithClaude(captionText) {
  if (!GEMINI_API_KEY) {
    console.warn('⚠️  GEMINI_API_KEY not set — returning unparsed product with needsReview: true');
    return {
      name: captionText.substring(0, 100).trim(),
      price: null,
      currency: 'MAD',
      category: 'Other',
      description: captionText,
      needsReview: true,
    };
  }

  const prompt = `You are a product data extractor for a Moroccan B2B wholesale marketplace. Parse the following Telegram post caption and extract product information.

RULES:
- Return ONLY valid JSON, no markdown, no explanation, no extra text.
- If you can clearly identify a product name, set "name" to it. Otherwise use the first meaningful phrase.
- If a price is clearly mentioned (numbers followed by currency like MAD, DH, €, $, درهم), extract "price" as a number and "currency" as the currency code (MAD, EUR, USD, AED). If no price is found, set "price" to null and "currency" to "MAD".
- For "category", choose the BEST match from this list: Fashion & Clothing, Beauty & Cosmetics, Electronics, Home & Kitchen, Food & Beverages, Health & Wellness, Sports & Outdoors, Toys & Games, Automotive, Office & Stationery, Jewelry & Watches, Bags & Accessories, Shoes & Footwear, Baby & Kids, Pet Supplies, Other.
- For "description", write a clean 1-2 sentence product description based on the caption.
- Set "needsReview" to true ONLY if the caption is unclear, ambiguous, doesn't seem to be about a product, or you had to guess significantly. Set to false if you're confident.

CAPTION:
"""
${captionText}
"""

Respond with ONLY this JSON format:
{"name": "...", "price": null, "currency": "MAD", "category": "...", "description": "...", "needsReview": false}`;

  try {
    const response = await axios.post(
      `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 512,
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      }
    );

    // Extract text from Gemini response
    const candidate = response.data?.candidates?.[0];
    const textPart = candidate?.content?.parts?.[0]?.text;

    if (!textPart) {
      throw new Error('No text in Gemini response');
    }

    // Parse the JSON response
    let rawText = textPart.trim();

    // Strip markdown code fences if Gemini added them
    if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    const parsed = JSON.parse(rawText);

    return {
      name: parsed.name || captionText.substring(0, 100).trim(),
      price: typeof parsed.price === 'number' ? parsed.price : null,
      currency: parsed.currency || 'MAD',
      category: parsed.category || 'Other',
      description: parsed.description || captionText,
      needsReview: !!parsed.needsReview,
    };
  } catch (err) {
    console.error('Gemini parsing error:', err.message);
    // Fallback: return the raw caption with needsReview flag
    return {
      name: captionText.substring(0, 100).trim(),
      price: null,
      currency: 'MAD',
      category: 'Other',
      description: captionText,
      needsReview: true,
    };
  }
}

module.exports = { parseCaptionWithClaude };
