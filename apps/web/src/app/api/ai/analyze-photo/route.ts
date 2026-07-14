// AI Photo Analysis API Route — Smart Tiered Analysis
// 1. Try Qwen3 VL 8B (cheap, fast) — sends actual photo for vision analysis
// 2. If confidence < 70% → fallback to GPT-4o Mini (more capable)
// 3. Caches results to avoid redundant AI calls

import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { requireAuth } from '@/lib/api-auth'
import { calcDeposit } from '@/lib/plan-pricing'
import { DEPOSIT_PRICE_IDS } from '@/lib/feature-gates'

const CACHE_TTL = 60 * 60 * 1000 // 1 hour
const responseCache = new Map<string, { data: any; expiry: number }>()
const LABOR_RATE = 120
const TAX_RATE = 0.085
const CONFIDENCE_THRESHOLD = 70

const AI_SYSTEM_PROMPT = `You are a master plumber with 30 years of experience. Analyze the photo of the plumbing issue and the customer's description, then provide a detailed professional estimate. Return ONLY valid JSON, no other text.

Look carefully at the photo. Identify:
- What type of plumbing fixture/problem is shown (faucet, pipe, toilet, drain, water heater, etc.)
- The specific issue (leak, clog, corrosion, break, wear, etc.)
- Visible damage, wear patterns, or signs of the problem
- The likely brand/model if identifiable

Return:
{
  "diagnosis": "A specific, detailed diagnosis based on what you SEE in the photo (e.g. 'The photo shows a Moen bathroom faucet with water pooling around the base, indicating a failed O-ring seal. Mineral deposits visible on the handle suggest a slow leak that has been ongoing for weeks.')",
  "severity": "low|moderate|high|emergency",
  "estimatedHours": number (realistic labor, 0.5-4),
  "parts": [
    {"name": "Specific part with brand/model", "qty": number, "unitPrice": number}
  ],
  "confidence": number (0-100 based on how clearly the issue is visible in the photo)
}

Parts pricing reference:
- Faucet: cartridge $25-45, O-rings $3-8, valve seat $8-15
- Toilet: flapper $5-12, fill valve $15-25, wax ring $6-10
- Pipe: section $8-20/ft, coupling $3-8, shut-off valve $15-30
- Water heater: element $25-45, thermostat $30-55, anode rod $20-35
- Drain: P-trap $12-25, snake rental $35-65
- Garbage disposal: unit $80-200, mounting ring $10-15

Labor rate is $120/hr. Return ONLY the JSON object.`

async function callOpenRouter(model: string, userMessage: string, photoBase64: string | null, openrouterKey: string) {
  // Build message content — with or without image
  const userContent: any[] = [
    { type: 'text', text: `${AI_SYSTEM_PROMPT}\n\nCustomer description: "${userMessage || 'Customer reported a plumbing issue'}"` }
  ];

  // If photo provided, include it as a vision input
  if (photoBase64 && photoBase64.length > 100) {
    userContent.push({
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${photoBase64}` }
    });
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openrouterKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://plumbcore-ai.vercel.app',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'user', content: userContent }
      ],
      temperature: 0.3,
      max_tokens: 1024,
    })
  })

  if (!response.ok) {
    const text = await response.text()
    console.error(`${model} returned ${response.status}: ${text.slice(0, 300)}`)
    return null
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || ''
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    console.error(`${model} returned non-JSON: ${content.slice(0, 200)}`)
    return null
  }

  try {
    return JSON.parse(jsonMatch[0])
  } catch {
    console.error(`${model} JSON parse failed: ${jsonMatch[0].slice(0, 200)}`)
    return null
  }
}

function buildResult(parsed: any) {
  let parts = (parsed.parts || []).map((p: any) => ({
    name: p.name || 'Part',
    qty: p.qty || 1,
    unitPrice: p.unitPrice || 0,
    total: Math.round((p.qty * p.unitPrice) * 100) / 100
  }));
  
  if (parts.length === 0 || parts.every((p: any) => p.unitPrice === 0)) {
    parts = [
      { name: 'Diagnostic assessment & inspection', qty: 1, unitPrice: 49, total: 49 },
      { name: 'Service call fee', qty: 1, unitPrice: 29, total: 29 },
    ];
  }
  const partsTotal = Math.round(parts.reduce((s: number, p: any) => s + p.total, 0) * 100) / 100
  const estimatedHours = parsed.estimatedHours || 1.0
  const laborCost = Math.round(estimatedHours * LABOR_RATE * 100) / 100
  const tax = Math.round((laborCost + partsTotal) * TAX_RATE * 100) / 100
  const totalPrice = Math.round((laborCost + partsTotal + tax) * 100) / 100
  const confidence = Math.min(100, Math.max(0, parsed.confidence || 85))

  const depositInfo = calcDeposit(totalPrice)
  const tierKey = depositInfo.tier.toLowerCase().replace(/[^a-z]/g, '')
  const depositTierMap: Record<string, string> = {
    small: 'small',
    medium: 'medium',
    large: 'large',
    premium: 'premium',
  }
  const depositTierKey = depositTierMap[tierKey] || 'small'
  return {
    diagnosis: parsed.diagnosis || 'Plumbing issue detected',
    severity: parsed.severity || 'moderate',
    estimatedHours,
    laborRate: LABOR_RATE,
    laborCost,
    parts,
    partsTotal,
    tax,
    taxRate: TAX_RATE,
    totalPrice,
    confidence,
    deposit: depositInfo.deposit,
    depositTier: depositInfo.tier,
    depositPriceId: DEPOSIT_PRICE_IDS[depositTierKey] || DEPOSIT_PRICE_IDS.small,
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { photoBase64, customerDescription, customerPhone } = await request.json()
    const cacheKey = createHash('md5').update((photoBase64 || '') + (customerDescription || 'default')).digest('hex')

    const cached = responseCache.get(cacheKey)
    if (cached && cached.expiry > Date.now()) {
      return NextResponse.json({ success: true, result: cached.data, cached: true })
    }

    const openrouterKey = process.env.OPENROUTER_API_KEY || ''
    if (!openrouterKey) {
      console.error('OPENROUTER_API_KEY not configured')
      return NextResponse.json({ success: false, error: 'AI not configured' }, { status: 500 })
    }

    // ── TIER 1: Qwen3 VL 8B (vision model) with actual photo ──
    const tier1Result = await callOpenRouter('qwen/qwen3-vl-8b-instruct', customerDescription || '', photoBase64 || null, openrouterKey)
    
    let finalParsed = tier1Result
    let usedFallback = false
    let modelUsed = 'qwen/qwen3-vl-8b-instruct'

    // ── TIER 2: GPT-4o Mini fallback ──
    if (!tier1Result || (tier1Result.confidence ?? 0) < CONFIDENCE_THRESHOLD) {
      console.log(`Qwen confidence ${tier1Result?.confidence ?? 'N/A'} < ${CONFIDENCE_THRESHOLD} — trying GPT-4o Mini`)
      const tier2Result = await callOpenRouter('openai/gpt-4o-mini', customerDescription || '', photoBase64 || null, openrouterKey)
      if (tier2Result) {
        finalParsed = tier2Result
        usedFallback = true
        modelUsed = 'openai/gpt-4o-mini'
      }
    }

    if (!finalParsed) {
      return NextResponse.json({ success: false, error: 'Analysis failed' }, { status: 500 })
    }

    const result = buildResult(finalParsed)
    responseCache.set(cacheKey, { data: result, expiry: Date.now() + CACHE_TTL })

    return NextResponse.json({
      success: true,
      result,
      model: modelUsed,
      fallback: usedFallback,
    })

  } catch (error) {
    console.error('AI Analysis Error:', error)
    return NextResponse.json({ success: false, error: 'Analysis failed' }, { status: 500 })
  }
}
