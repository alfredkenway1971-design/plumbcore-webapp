import OpenAI from 'openai';

const VISION_MODEL = 'qwen/qwen3-vl-8b-instruct';
const CHAT_MODEL = 'qwen/qwen3-vl-8b-instruct';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }
    client = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://plumbcore-webapp.vercel.app',
        'X-Title': 'PlumbCore AI',
      },
    });
  }
  return client;
}

export async function analyzePlumbingPhoto(base64Image: string): Promise<{
  detectedIssue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  estimatedParts: string[];
  estimatedLaborMin: number;
  estimatedLaborMax: number;
  description: string;
  confidence: number; // 0 to 1
}> {
  // Single model — no cascade, no fallback. One call, done.
  const model = { id: 'qwen/qwen3-vl-8b-instruct', label: 'Qwen3 VL 8B' };

  const client = getClient();

  try {
    const response = await client.chat.completions.create({
      model: model.id,
      messages: [
          {
            role: 'system',
            content: `You are a master plumber AI that analyzes photos of plumbing issues.
Return ONLY valid JSON with these fields:
- detectedIssue: short name of the problem
- severity: "low" | "medium" | "high" | "critical"
- estimatedParts: array of part names needed
- estimatedLaborMin: minimum labor cost
- estimatedLaborMax: maximum labor cost
- description: detailed description of what you see
- confidence: your confidence in this analysis (0.0 to 1.0)

Common plumbing issues: leaking pipe, clogged drain, broken toilet flapper, water heater leak,
frozen pipe, sewer backup, faucet drip, garbage disposal jam, sump pump failure.

Be honest about your confidence: if the image is blurry, missing key details, or shows a complex issue you cannot fully assess, give a lower confidence score.`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this plumbing issue photo and give me a repair estimate with confidence score.' },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.1,
      });

      const text = response.choices[0]?.message?.content || '{}';
      const cleaned = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
      const parsed = JSON.parse(cleaned);

      if (parsed.detectedIssue && parsed.severity && Array.isArray(parsed.estimatedParts) &&
          typeof parsed.estimatedLaborMin === 'number' && typeof parsed.estimatedLaborMax === 'number' &&
          typeof parsed.description === 'string' && typeof parsed.confidence === 'number') {
        return parsed;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      throw err;
    }

  // Should not reach here
  throw new Error('Failed to analyze photo');
}

export async function chatWithAI(
  messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  // Single cheap model — no cascade, no fallback
  const client = getClient();

  try {
    const response = await client.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are PlumbCore AI — an expert plumbing assistant for a SaaS platform.
Help customers describe their plumbing issues, provide rough estimates, and book service.
Be friendly, professional, and clear. Ask clarifying questions when needed.
Keep responses concise (2-3 sentences).`,
        },
        ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (content && content.trim().length > 0) {
      return content;
    }
  } catch (err) {
    throw err;
  }

  return 'Sorry, I could not process that.';
}

export async function transcribeNoteToInvoice(noteText: string): Promise<{
  lineItems: { description: string; quantity: number; unitPrice: number; total: number }[];
  subtotal: number;
  total: number;
}> {
  const c = getClient();
  const response = await c.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are an invoice generation assistant for plumbers.
A plumber has dictated notes after completing a job. Extract the work done and parts used,
and generate invoice line items.

Return ONLY valid JSON (no markdown):
{
  "lineItems": [{ "description": string, "quantity": number, "unitPrice": number, "total": number }],
  "subtotal": number,
  "total": number
}

For common plumbing jobs, use realistic prices:
- Toilet replacement: $185-350 labor
- Faucet repair: $85-145 labor
- Drain cleaning: $95-295 labor
- Water heater: $165-495 labor
Add parts costs as separate line items.`,
      },
      { role: 'user', content: noteText },
    ],
    max_tokens: 500,
    temperature: 0.1,
  });

  const text = response.choices[0]?.message?.content || '{}';
  const cleaned = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  return JSON.parse(cleaned);
}

export async function inventoryAnalysis(
  inventory: { name: string; quantity: number; minStock: number; usage: number }[]
): Promise<{ insights: { message: string; type: 'reorder' | 'overstock' | 'deadstock' }[] }> {
  const c = getClient();
  const response = await c.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are an inventory intelligence AI for a plumbing supply company.
Analyze the inventory data and return insights about what to reorder, what's overstocked,
and what hasn't been used.

Return ONLY valid JSON (no markdown):
{
  "insights": [
    { "message": string, "type": "reorder" | "overstock" | "deadstock" }
  ]
}
Limit to 5 most important insights. Be specific with part names and quantities.`,
      },
      { role: 'user', content: `Inventory data: ${JSON.stringify(inventory)}` },
    ],
    max_tokens: 500,
    temperature: 0.1,
  });

  const text = response.choices[0]?.message?.content || '{}';
  const cleaned = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  return JSON.parse(cleaned);
}

export async function detectPriceChanges(
  items: { name: string; currentPrice: number; lastPrice: number }[]
): Promise<{ changes: { name: string; oldPrice: number; newPrice: number; change: number; recommendation: string }[] }> {
  const c = getClient();
  const response = await c.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a pricing analyst for plumbing parts. Compare current and last prices,
flag increases over 5%, and suggest updated prices.

Return ONLY valid JSON (no markdown):
{
  "changes": [
    { "name": string, "oldPrice": number, "newPrice": number, "change": number (percent), "recommendation": string }
  ]
}`,
      },
      { role: 'user', content: JSON.stringify(items) },
    ],
    max_tokens: 500,
    temperature: 0.1,
  });

  const text = response.choices[0]?.message?.content || '{}';
  const cleaned = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  return JSON.parse(cleaned);
}