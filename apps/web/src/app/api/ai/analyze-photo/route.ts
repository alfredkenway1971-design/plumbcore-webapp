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

const AI_SYSTEM_PROMPT = `As a master plumber, analyze this plumbing issue and return a detailed estimate as JSON ONLY. No other text.

Return valid JSON with exactly this structure:
{
  "diagnosis": "clear diagnosis of the problem",
  "severity": "low|moderate|high|emergency",
  "estimatedHours": number,
  "parts": [
    {"name": "part name", "qty": number, "unitPrice": number}
  ],
  "confidence": number (0-100)
}

Use realistic pricing: labor_rate=$120/hr. Parts examples: faucet repair kit=$28, washers (pack of 5)=$4.50, teflon tape=$3.00, PVC pipe 3ft=$12, faucet cartridge=$35, wax ring=$8, water supply line=$15, p-trap=$18, shut-off valve=$22, drain snake=$45. Return ONLY the JSON object.`

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
  const parts = (parsed.parts || []).map((p: any) => ({
    name: p.name || 'Parts',
    qty: p.qty || 1,
    unitPrice: p.unitPrice || 0,
    total: Math.round((p.qty * p.unitPrice) * 100) / 100
  }))
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
