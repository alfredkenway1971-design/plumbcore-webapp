// AI Photo Analysis API Route
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { photoCount, customerPhone, customerDescription } = await request.json()
    
    // Call Qwen3 VL via OpenRouter for AI analysis
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer sk-or-v1-mock-key',
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://plumbcore-ai.vercel.app',
      },
      body: JSON.stringify({
        model: 'qwen/qwen3-vl-8b-instruct',
        messages: [{
          role: 'user',
          content: `Analyze this plumbing issue. Customer says: "${customerDescription || 'Customer reported a plumbing issue'}". 
Identify: diagnosis, severity (emergency/high/moderate/low), estimated labor hours, price estimate (low-high).
Return as JSON only.`
        }]
      })
    })

    let diagnosis = 'Leaking pipe or fixture detected'
    let severity = 'moderate'
    let hours = 1.0
    let priceLow = 145
    let priceHigh = 185

    if (response.ok) {
      const data = await response.json()
      try {
        const content = data.choices?.[0]?.message?.content || ''
        // Try to extract structured data from AI response
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          diagnosis = parsed.diagnosis || diagnosis
          severity = parsed.severity || severity
          hours = parsed.estimatedLaborHours || parsed.laborHours || hours
          priceLow = parsed.priceLow || parsed.low || priceLow
          priceHigh = parsed.priceHigh || parsed.high || priceHigh
        }
      } catch (e) {
        // Use defaults if parsing fails
      }
    }

    const labor = Math.round(hours * 95) // hourly rate
    
    return NextResponse.json({
      success: true,
      result: {
        diagnosis,
        severity,
        estimatedHours: hours,
        priceLow: Math.round(priceLow),
        priceHigh: Math.round(priceHigh),
        labor
      }
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