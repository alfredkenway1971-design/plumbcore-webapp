// AI Photo Analysis API Route — Single powerful model
// Uses GPT-4o Mini as the primary model for accurate pricing
// Caches results to avoid redundant AI calls

import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { calcDeposit } from '@/lib/plan-pricing'
import { DEPOSIT_PRICE_IDS } from '@/lib/feature-gates'

const CACHE_TTL = 60 * 60 * 1000 // 1 hour
const responseCache = new Map<string, { data: any; expiry: number }>()
const TAX_RATE = 0.085
const CONFIDENCE_THRESHOLD = 70
const MIN_CONFIDENCE_FOR_ESTIMATE = 80

// Severity-based pricing tiers
const SEVERITY_PRICING: Record<string, { laborRate: number; travelFee: number; validityDays: number; label: string }> = {
  low:      { laborRate: 130, travelFee: 130, validityDays: 7,  label: 'Standard' },
  moderate: { laborRate: 130, travelFee: 130, validityDays: 7,  label: 'Standard' },
  urgent:   { laborRate: 180, travelFee: 130, validityDays: 2,  label: 'Urgent' },
  high:     { laborRate: 180, travelFee: 130, validityDays: 2,  label: 'Urgent' },
  emergency:{ laborRate: 250, travelFee: 350, validityDays: 1,  label: 'Emergency' },
}

const AI_SYSTEM_PROMPT = `You are a master plumber with 30 years of experience. Analyze the photo of the plumbing issue and the customer's description, then provide a detailed professional estimate. Return ONLY valid JSON, no other text.

CRITICAL: You MUST include specific parts with their exact prices in the "parts" array. Do NOT leave parts empty. Every estimate needs at least 2-5 specific parts.

Look carefully at the photo. Identify:
- What type of plumbing fixture/problem is shown (faucet, pipe, toilet, drain, water heater, etc.)
- The specific issue (leak, clog, corrosion, break, wear, etc.)
- Visible damage, wear patterns, or signs of the problem
- The likely brand/model if identifiable

Return:
{
  "diagnosis": "A specific, detailed diagnosis based on what you SEE in the photo (e.g. 'The photo shows a Moen bathroom faucet with water pooling around the base, indicating a failed O-ring seal. Mineral deposits visible on the handle suggest a slow leak that has been ongoing for weeks.')",
  "severity": "low|moderate|high|emergency",
  "estimatedHours": number (realistic labor, 0.5-8 based on severity),
  "parts": [
    {"name": "Specific part name with brand/model/size", "qty": number, "unitPrice": number}
  ],
  "confidence": number (0-100 based on how clearly the issue is visible in the photo)
}

IMPORTANT: The "parts" array MUST contain real, specific parts with exact prices. Here are examples of good parts arrays for common issues:

For a burst pipe: [{"name":"4ft section of 3/4\" copper pipe Type L","qty":1,"unitPrice":18},{"name":"2x 3/4\" copper coupling","qty":2,"unitPrice":4},{"name":"Flux & solder kit","qty":1,"unitPrice":12},{"name":"Shut-off valve 3/4\"","qty":1,"unitPrice":22}]

For a faucet leak: [{"name":"Faucet cartridge (brand-specific)","qty":1,"unitPrice":35},{"name":"O-ring seal set","qty":1,"unitPrice":8},{"name":"Valve seat wrench","qty":1,"unitPrice":12}]

For a toilet issue: [{"name":"Fluidmaster fill valve 400A","qty":1,"unitPrice":18},{"name":"Korky wax ring with flange","qty":1,"unitPrice":8},{"name":"Fluidmaster flapper","qty":1,"unitPrice":7}]

For a water heater: [{"name":"Water heater 40gal electric","qty":1,"unitPrice":550},{"name":"Flexible water heater connectors","qty":2,"unitPrice":15},{"name":"T&P relief valve","qty":1,"unitPrice":18},{"name":"Gas line connector (if gas)","qty":1,"unitPrice":22}]

For drain clog: [{"name":"Drain snake cable 50ft","qty":1,"unitPrice":35},{"name":"Drain cleaning solvent","qty":1,"unitPrice":15}]

Parts pricing reference:
- Faucet: cartridge $25-45, O-rings $3-8, valve seat $8-15, handle $15-30
- Toilet: flapper $5-12, fill valve $15-25, wax ring $6-10, bowl gasket $8-15
- Pipe (copper): section 3/4\" $15-25/ft, coupling $3-8, elbow $3-6, shut-off valve $15-30, PEX $1-3/ft
- Pipe (PVC): section 2\" $5-10/ft, coupling $2-5, 90° elbow $2-4, cleanout adapter $5-10
- Water heater: element $25-45, thermostat $30-55, anode rod $20-35, dip tube $12-20
- Drain: P-trap $12-25, snake rental $35-65, auger head $15-30
- Garbage disposal: unit $80-200, mounting ring $10-15, splash guard $5-10
- Sump pump: pump $80-150, check valve $15-25, discharge pipe $10-20
- Water softener: resin $40-80, control valve $120-250, bypass valve $25-45

Labor rate is $120/hr. Return ONLY the JSON object.`

async function callOpenRouter(model: string, userMessage: string, photoBase64: string | null, openrouterKey: string, locale: string = 'en') {
  // Build message content — with or without image
  const langInstruction = locale === 'fr' ? '\n\nIMPORTANT: Respond in French. Write the diagnosis, parts names, and all text in French.'
    : locale === 'es' ? '\n\nIMPORTANTE: Responda en español. Escriba el diagnóstico, nombres de piezas y todo el texto en español.'
    : locale === 'de' ? '\n\nWICHTIG: Antworten Sie auf Deutsch. Schreiben Sie die Diagnose, Teilebezeichnungen und den gesamten Text auf Deutsch.'
    : '';
  const userContent: any[] = [
    { type: 'text', text: `${AI_SYSTEM_PROMPT}${langInstruction}\n\nCustomer description: "${userMessage || 'Customer reported a plumbing issue'}"` }
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

function buildResult(parsed: any, severity: string = 'moderate', urgency: string = 'routine') {
  // Determine pricing tier from urgency (user selection) — COMPLETELY overrides severity
  // Routine → always standard pricing regardless of what AI says
  const pricingTier = urgency === 'emergency' ? 'emergency' : 
                       urgency === 'urgent' ? 'urgent' : 
                       urgency === 'routine' ? 'moderate' :
                       (severity === 'emergency' || severity === 'high') ? 'emergency' :
                       (severity === 'urgent') ? 'urgent' : 'moderate'
  const pricing = SEVERITY_PRICING[pricingTier] || SEVERITY_PRICING.moderate
  const laborRate = pricing.laborRate
  const travelFee = pricing.travelFee
  const validityDays = pricing.validityDays
  const severityLabel = pricing.label
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
  const laborCost = Math.round(estimatedHours * laborRate * 100) / 100
  const travelFeeAmount = travelFee
  const subtotal = laborCost + partsTotal + travelFeeAmount
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100
  const totalPrice = Math.round((subtotal + tax) * 100) / 100
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
  const canProvideEstimate = confidence >= MIN_CONFIDENCE_FOR_ESTIMATE
  return {
    canProvideEstimate,
    diagnosis: parsed.diagnosis || 'Plumbing issue detected',
    severity: parsed.severity || 'moderate',
    severityLabel,
    validityDays,
    estimatedHours: canProvideEstimate ? estimatedHours : 0,
    laborRate,
    laborCost: canProvideEstimate ? laborCost : 0,
    travelFee: canProvideEstimate ? travelFeeAmount : 0,
    parts: canProvideEstimate ? parts : [],
    partsTotal: canProvideEstimate ? partsTotal : 0,
    tax: canProvideEstimate ? tax : 0,
    taxRate: TAX_RATE,
    totalPrice: canProvideEstimate ? totalPrice : 0,
    confidence,
    deposit: canProvideEstimate ? depositInfo.deposit : 0,
    depositAmount: canProvideEstimate ? depositInfo.deposit : 0,
    depositTier: canProvideEstimate ? depositInfo.tier : '',
    depositPriceId: canProvideEstimate ? (DEPOSIT_PRICE_IDS[depositTierKey] || DEPOSIT_PRICE_IDS.small) : '',
  }
}

export async function POST(request: NextRequest) {
  try {
    const { photoBase64, customerDescription, customerPhone, urgency, locale } = await request.json()
    const cacheKey = createHash('md5').update((photoBase64 || '') + (customerDescription || 'default') + (locale || 'en')).digest('hex')

    const cached = responseCache.get(cacheKey)
    if (cached && cached.expiry > Date.now()) {
      return NextResponse.json({ success: true, result: cached.data, cached: true })
    }

    const openrouterKey = process.env.OPENROUTER_API_KEY || ''
    if (!openrouterKey) {
      console.error('OPENROUTER_API_KEY not configured')
      return NextResponse.json({ success: false, error: 'AI not configured' }, { status: 500 })
    }

    // ── PRIMARY: GPT-4o Mini (more accurate pricing) ──
    const primaryResult = await callOpenRouter('openai/gpt-4o-mini', customerDescription || '', photoBase64 || null, openrouterKey, locale)
    
    let finalParsed = primaryResult
    let modelUsed = 'openai/gpt-4o-mini'

    // ── FALLBACK: Qwen3 VL 8B (if GPT-4o Mini fails) ──
    if (!primaryResult) {
      console.log('GPT-4o Mini failed — trying Qwen3 VL 8B as fallback')
      const fallbackResult = await callOpenRouter('qwen/qwen3-vl-8b-instruct', customerDescription || '', photoBase64 || null, openrouterKey, locale)
      if (fallbackResult) {
        finalParsed = fallbackResult
        modelUsed = 'qwen/qwen3-vl-8b-instruct'
      }
    }

    if (!finalParsed) {
      return NextResponse.json({ success: false, error: 'Analysis failed' }, { status: 500 })
    }

    const result = buildResult(finalParsed, finalParsed?.severity || 'moderate', urgency || 'routine')
    responseCache.set(cacheKey, { data: result, expiry: Date.now() + CACHE_TTL })

    return NextResponse.json({
      success: true,
      result,
      model: modelUsed,
    })

  } catch (error) {
    console.error('AI Analysis Error:', error)
    return NextResponse.json({ success: false, error: 'Analysis failed' }, { status: 500 })
  }
}
