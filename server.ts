import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = 3000;
const isProd = process.env.NODE_ENV === 'production';

// Allow up to 25mb for high resolution food photos
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasAnthropicKey: Boolean(process.env.ANTHROPIC_API_KEY),
  });
});

interface FoodItemAnalysis {
  name: string;
  calories_per_100g: number;
  protein_g_per_100g: number;
  carbs_g_per_100g: number;
  fat_g_per_100g: number;
  confidence: 'low' | 'medium' | 'high';
  suggested_weight_g?: number;
}

interface AnalysisResult {
  items: FoodItemAnalysis[];
  notes?: string;
  isFood?: boolean;
}

// System prompt emphasizing accuracy, South Asian/Nepali cuisine recognition, and strict JSON format
const FOOD_VISION_PROMPT = `You are a certified clinical nutritionist and visual food analysis engine.
Analyze the attached food photograph with high precision.
Identify all individual food items, components, or dishes visible on the plate, bowl, or container.
Special attention must be given to recognizing traditional and regional foods including South Asian / Nepali dishes (e.g., Dal Bhat, Momo, Roti / Chapati, Sel Roti, Chowmein, Samosa, Thukpa, Aloo Tama, Chicken/Mutton Curry, Saag, Pulao, Paneer Butter Masala, Biryani) as well as global everyday foods (grilled chicken, eggs, rice, oatmeal, salmon, salads, pizza, pasta, burgers, fruits, smoothies).

For each detected food item, provide:
1. "name": Specific dish or component name (e.g. "Steamed Chicken Momo", "Yellow Lentil Dal", "Steamed Basmati Rice")
2. "calories_per_100g": Estimated energy in kcal per 100 grams
3. "protein_g_per_100g": Protein in grams per 100g
4. "carbs_g_per_100g": Total carbohydrates in grams per 100g
5. "fat_g_per_100g": Dietary fat in grams per 100g
6. "confidence": One of "low", "medium", or "high"
7. "suggested_weight_g": Approximate standard portion size in grams seen in photo (e.g., 150 for a cup of rice, 200 for a serving of momo)

CRITICAL INSTRUCTIONS:
- If the image contains no food, beverages, or edible groceries, return:
  {"items": [], "notes": "No food or drink detected. Please upload or capture a photo showing your meal.", "isFood": false}
- Return ONLY pure, raw JSON. Do NOT wrap in markdown \`\`\`json or add conversational text.

Schema:
{
  "items": [
    {
      "name": "string",
      "calories_per_100g": number,
      "protein_g_per_100g": number,
      "carbs_g_per_100g": number,
      "fat_g_per_100g": number,
      "confidence": "low" | "medium" | "high",
      "suggested_weight_g": number
    }
  ],
  "notes": "Brief observation on cooking method (e.g. fried vs steamed, gravy consistency, visible butter/oil)",
  "isFood": true
}`;

/**
 * Clean and parse JSON from LLM output
 */
function extractAndParseJSON(rawText: string): AnalysisResult {
  let cleaned = rawText.trim();
  // Strip markdown code block fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  }
  
  // Find first { and last }
  const startIdx = cleaned.indexOf('{');
  const endIdx = cleaned.lastIndexOf('}');
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }

  const parsed = JSON.parse(cleaned);
  if (!parsed.items || !Array.isArray(parsed.items)) {
    throw new Error('Invalid JSON structure: missing items array');
  }

  // Validate and sanitize numeric fields
  const items: FoodItemAnalysis[] = parsed.items.map((item: any) => ({
    name: String(item.name || 'Unknown Food Item'),
    calories_per_100g: Math.max(0, Math.round(Number(item.calories_per_100g) || 0)),
    protein_g_per_100g: Math.max(0, Math.round((Number(item.protein_g_per_100g) || 0) * 10) / 10),
    carbs_g_per_100g: Math.max(0, Math.round((Number(item.carbs_g_per_100g) || 0) * 10) / 10),
    fat_g_per_100g: Math.max(0, Math.round((Number(item.fat_g_per_100g) || 0) * 10) / 10),
    confidence: ['low', 'medium', 'high'].includes(item.confidence) ? item.confidence : 'medium',
    suggested_weight_g: Math.max(10, Math.round(Number(item.suggested_weight_g) || 150)),
  }));

  return {
    items,
    notes: parsed.notes ? String(parsed.notes) : undefined,
    isFood: parsed.isFood !== false && items.length > 0,
  };
}

// POST /api/analyze-food
app.post('/api/analyze-food', async (req: Request, res: Response) => {
  try {
    const { image, mimeType = 'image/jpeg', provider = 'auto' } = req.body;

    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Image data is required (base64 string).' });
    }

    // Clean base64 data (strip data:image/xxx;base64, prefix if client included it)
    const base64Data = image.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    // Check if Claude provider requested and ANTHROPIC_API_KEY is present
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if ((provider === 'claude' || !geminiApiKey) && anthropicApiKey) {
      try {
        const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicApiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-latest',
            max_tokens: 1024,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'image',
                    source: {
                      type: 'base64',
                      media_type: mimeType,
                      data: base64Data,
                    },
                  },
                  {
                    type: 'text',
                    text: FOOD_VISION_PROMPT,
                  },
                ],
              },
            ],
          }),
        });

        if (anthropicRes.ok) {
          const anthropicData = await anthropicRes.json();
          const textBlock = anthropicData.content?.find((c: any) => c.type === 'text');
          if (textBlock?.text) {
            const parsed = extractAndParseJSON(textBlock.text);
            return res.json({ ...parsed, provider: 'claude' });
          }
        }
      } catch (anthropicErr) {
        console.warn('Anthropic API attempt failed, falling back to Gemini:', anthropicErr);
      }
    }

    // Default & recommended engine in AI Studio: Gemini 3.8 Flash via @google/genai SDK
    if (!geminiApiKey) {
      // If neither key is configured in dev environment, return fallback nutritional estimation
      return res.json({
        items: [
          {
            name: "Mixed Healthy Meal",
            calories_per_100g: 165,
            protein_g_per_100g: 9.5,
            carbs_g_per_100g: 22.0,
            fat_g_per_100g: 4.8,
            confidence: "medium",
            suggested_weight_g: 250,
          }
        ],
        notes: "Demo estimate (GEMINI_API_KEY not set in local env). Configure GEMINI_API_KEY for live vision recognition.",
        isFood: true,
        provider: 'mock-fallback',
      });
    }

    const ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType || 'image/jpeg',
              },
            },
            {
              text: FOOD_VISION_PROMPT,
            },
          ],
        },
      ],
      config: {
        temperature: 0.2,
      },
    });

    const responseText = response.text || '';
    if (!responseText) {
      throw new Error('Empty response received from vision model');
    }

    const result = extractAndParseJSON(responseText);
    return res.json({
      ...result,
      provider: 'gemini',
    });
  } catch (err: any) {
    console.error('Food analysis error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to analyze food photo',
      isFood: false,
      items: [],
    });
  }
});

async function startServer() {
  if (!isProd) {
    // Development mode with Vite dev middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware attached in development mode.');
  } else {
    // Production mode
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NutriSnap server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting NutriSnap server:', err);
  process.exit(1);
});
