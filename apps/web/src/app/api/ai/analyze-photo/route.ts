// AI Photo Analysis API Route — Smart Tiered Analysis
// 1. Try Qwen3 VL 8B (cheap, fast)
// 2. If confidence < 70% → fallback to GPT-4o Mini (more capable)
// 3. Caches results to avoid redundant AI calls

import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

const CACHE_TTL = 60 * 60 * 1000 // 1 hour
const responseCache = new Map<string, { data: any; expiry: number }>()
const LABOR_RATE = 120
const TAX_RATE = 0.085
const CONFIDENCE_THRESHOLD = 70 // fallback if confidence below this

const AI_SYSTEM_PROMPT = `You are a master plumber with 30 years of experience. Analyze the customer's plumbing issue description and provide a detailed professional estimate. Return ONLY valid JSON, no other text.

Based on the customer's description, identify the most likely specific plumbing problem and return:
{
  "diagnosis": "A specific, professional diagnosis describing the exact issue (e.g. 'Worn-out Moen 1225 cartridge causing persistent drip from bathroom faucet, with mineral buildup on valve seat')",
  "severity": "low|moderate|high|emergency",
  "estimatedHours": number (realistic labor hours, typically 0.5-4),
  "parts": [
    {"name": "Specific part name with brand/model if relevant", "qty": number, "unitPrice": number}
  ],
  "confidence": number (0-100, how confident you are in this diagnosis)
}

Be realistic and specific. Common plumbing issues and their typical parts:
- Faucet leak: cartridge ($25-45), O-rings ($3-8), valve seat ($8-15), handle kit ($15-30)
- Clogged drain: drain snake rental ($35-65), enzyme treatment ($12-20), P-trap ($12-25)
- Running toilet: flapper ($5-12), fill valve ($15-25), flush valve seal ($8-15), wax ring ($6-10)
- Water heater issue: heating element ($25-45), thermostat ($30-55), pressure relief valve ($15-25), anode rod ($20-35)
- Pipe leak: pipe section ($8-20/ft), coupling ($3-8), shut-off valve ($15-30), pipe sealant ($5-10)
- Garbage disposal: disposal unit ($80-200), mounting ring ($10-15), power cord ($8-15)
- Low water pressure: pressure regulator ($40-75), aerator ($3-8), cartridge ($20-40), sediment filter ($15-30)
- Sump pump: pump unit ($150-350), check valve ($15-25), discharge pipe ($12-20), backup battery ($80-150)

Labor rate is $120/hr. Include all needed parts with realistic quantities and prices. Return ONLY the JSON.`

async function callOpenRouter(model: string, userMessage: string, openrouterKey: string) {
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
        { role: 'user', content: `${AI_SYSTEM_PROMPT}\n\nCustomer says: "${userMessage || 'Customer reported a plumbing issue'}"` }
      ],
      temperature: 0.3,
      max_tokens: 1024,
    })
  })

  if (!response.ok) {
    const text = await response.text()
    console.error(`${model} returned ${response.status}: ${text}`)
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
  
  // If AI returned no parts, add a diagnostic fee as default
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
  }
}

export async function POST(request: NextRequest) {
  try {
    const { customerDescription, customerPhone } = await request.json()
    const cacheKey = createHash('md5').update(customerDescription || 'default').digest('hex')

    // Check cache
    const cached = responseCache.get(cacheKey)
    if (cached && cached.expiry > Date.now()) {
      return NextResponse.json({ success: true, result: cached.data, cached: true })
    }

    const openrouterKey = process.env.OPENROUTER_API_KEY || ''
    if (!openrouterKey) {
      return NextResponse.json({ success: false, error: 'AI not configured' }, { status: 500 })
    }

    // ── TIER 1: Try Qwen3 VL 8B (cheap, fast) ──
    const tier1Result = await callOpenRouter('qwen/qwen3-vl-8b-instruct', customerDescription || '', openrouterKey)
    
    let finalParsed = tier1Result
    let usedFallback = false
    let modelUsed = 'qwen/qwen3-vl-8b-instruct'

    // ── TIER 2: Fallback to GPT-4o Mini if confidence too low ──
    if (!tier1Result || (tier1Result.confidence ?? 0) < CONFIDENCE_THRESHOLD) {
      console.log(`Qwen confidence ${tier1Result?.confidence ?? 'N/A'} < ${CONFIDENCE_THRESHOLD} — trying GPT-4o Mini fallback`)
      const tier2Result = await callOpenRouter('gpt-4o-mini', customerDescription || '', openrouterKey)
      if (tier2Result) {
        finalParsed = tier2Result
        usedFallback = true
        modelUsed = 'gpt-4o-mini'
      }
      // If GPT-4o Mini also fails, keep Qwen's result (something is better than nothing)
    }

    if (!finalParsed) {
      return NextResponse.json({ success: false, error: 'Analysis failed' }, { status: 500 })
    }

    const result = buildResult(finalParsed)

    // Cache the result
    responseCache.set(cacheKey, { data: result, expiry: Date.now() + CACHE_TTL })

    return NextResponse.json({
      success: true,
      result,
      model: modelUsed,
      fallback: usedFallback,
    })

  } catch (error) {
    console.error('AI Analysis Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Analysis failed',
      message: 'Please try again or call us directly.'
    })
  }
}
