// AI Voice-to-Job API — Parse spoken description into structured job fields
// Uses Qwen3 8B via OpenRouter (cheapest capable model)

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'

const AI_MODEL = 'qwen/qwen3-8b' // cheapest capable model

async function callQwen(userMessage: string, openrouterKey: string) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openrouterKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://plumbcore-ai.vercel.app',
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a plumbing job assistant. Extract job details from the plumber's voice dictation.

Return ONLY valid JSON with this exact structure:
{
  "title": "short job title (max 10 words)",
  "description": "clear, professional description (2-3 sentences)",
  "suggestedClient": "extracted client name if mentioned, or empty string",
  "suggestedAddress": "extracted address if mentioned, or empty string"
}

Rules:
- Title must be concise: e.g. "Kitchen Sink Leak Repair", "Water Heater Replacement"
- Description should be professional and cohesive, rephrasing the spoken words
- Only extract client/address if clearly mentioned in the speech
- If nothing useful can be extracted, return empty strings
- Return ONLY the JSON object, no other text`
        },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.2,
      max_tokens: 512,
    })
  })

  if (!response.ok) {
    const text = await response.text()
    console.error(`Qwen voice-to-job returned ${response.status}: ${text}`)
    return null
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || ''
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    console.error(`Qwen voice-to-job non-JSON: ${content.slice(0, 200)}`)
    return null
  }

  try {
    return JSON.parse(jsonMatch[0])
  } catch {
    console.error(`Qwen voice-to-job JSON parse failed: ${jsonMatch[0].slice(0, 200)}`)
    return null
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { text } = await request.json()
    
    if (!text || typeof text !== 'string' || text.trim().length < 3) {
      return NextResponse.json({ error: 'Please provide at least a few words of dictation' }, { status: 400 })
    }

    const openrouterKey = process.env.OPENROUTER_API_KEY
    if (!openrouterKey) {
      // Fallback: basic parsing without AI
      const words = text.trim().split(/[.,!?;:]+/).map(s => s.trim()).filter(Boolean)
      const firstSentence = words[0] || text.trim()
      return NextResponse.json({
        title: firstSentence.length > 50 ? firstSentence.substring(0, 50) + '...' : firstSentence,
        description: text.trim(),
        suggestedClient: '',
        suggestedAddress: '',
      })
    }

    const result = await callQwen(text.trim(), openrouterKey)
    
    if (!result) {
      // Fallback to basic parsing
      return NextResponse.json({
        title: text.trim().substring(0, 60),
        description: text.trim(),
        suggestedClient: '',
        suggestedAddress: '',
      })
    }

    return NextResponse.json({
      title: result.title || text.trim().substring(0, 60),
      description: result.description || text.trim(),
      suggestedClient: result.suggestedClient || '',
      suggestedAddress: result.suggestedAddress || '',
    })
  } catch (err) {
    console.error('Voice-to-job error:', err)
    return NextResponse.json({ error: 'Failed to process voice input' }, { status: 500 })
  }
}
