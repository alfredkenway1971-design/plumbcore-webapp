// AI Receipt Processing API — extracts parts from a receipt photo
import { NextRequest, NextResponse } from 'next/server'

const AI_SYSTEM_PROMPT = `You are a plumbing inventory specialist. Analyze the photo of a receipt or invoice from a plumbing supply purchase and extract every item purchased.

Return ONLY valid JSON, no other text. Format:

{
  "items": [
    {
      "name": "Full part name exactly as written on receipt",
      "quantity": number,
      "unitPrice": number (price per unit),
      "totalPrice": number (quantity * unitPrice),
      "category": "pipe|fitting|valve|fixture|tool|sealant|heater|pump"
    }
  ],
  "supplier": "Name of supplier from receipt",
  "totalPaid": number (total amount paid on receipt),
  "date": "purchase date if visible"
}

CRITICAL RULES:
- Extract EVERY line item from the receipt. Do not skip any.
- Categorize each item correctly:
  - pipe: copper pipe, PVC pipe, PEX, tubing, any pipe material
  - fitting: couplings, elbows, tees, adapters, connectors, unions
  - valve: shut-off valves, ball valves, gate valves, check valves, pressure relief
  - fixture: faucets, toilets, sinks, water heaters, disposals, sump pumps
  - tool: wrenches, cutters, snakes, augers, drain cleaning tools
  - sealant: tape, dope, glue, cement, putty, caulk
  - heater: water heater parts (elements, thermostats, anode rods)
  - pump: sump pumps, well pumps, circulator pumps
- If category is unclear, choose the closest match.
- If supplier name is not visible, return "Unknown".
- If date is not visible, return empty string.
- Total should match the sum of all line items.
- Parse quantities correctly (e.g. "2 x $15.99" = quantity 2, unitPrice 15.99).
- Ignore sales tax, subtotals, and totals that are not individual line items.`

export async function POST(request: NextRequest) {
  try {
    const { photoBase64 } = await request.json()

    if (!photoBase64 || photoBase64.length < 100) {
      return NextResponse.json({ error: 'Valid photo required' }, { status: 400 })
    }

    const openrouterKey = process.env.OPENROUTER_API_KEY
    if (!openrouterKey) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 500 })
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://plumbcore-ai.vercel.app',
        'X-Title': 'PlumbCore AI',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: AI_SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extract all items from this receipt photo.' },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${photoBase64}` } },
            ],
          },
        ],
        max_tokens: 2000,
        temperature: 0.1,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('OpenRouter error:', response.status, errText)
      return NextResponse.json({ error: 'AI processing failed' }, { status: 502 })
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: 'AI returned empty response' }, { status: 502 })
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI returned invalid format' }, { status: 502 })
    }

    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json(parsed)
  } catch (error: any) {
    console.error('Receipt processing error:', error)
    return NextResponse.json({ error: error.message || 'Processing failed' }, { status: 500 })
  }
}
