// Supabase Edge Function for AI Photo Analysis
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export async function POST(request: Request, { context }: any) {
  try {
    // Parse request body
    const { photoBase64, companyId, customerDescription } = await request.json()
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get company settings
    const { data: companySettings } = await supabase
      .from('company_settings')
      .select('hourly_rate, markup_percentage, tax_rate')
      .eq('company_id', companyId)
      .single()
    
    if (!companySettings) {
      return new Response(JSON.stringify({ error: 'Company not found' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 404,
      })
    }
    
    // Decode base64 image
    const imageData = photoBase64.split(',')[1]
    
    // Call GPT-4 Vision API (using OpenRouter)
    const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions'
    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY')!
    
    const visionResponse = await fetch(openRouterUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://plumbcore-ai.vercel.app',
      },
      body: JSON.stringify({
        model: 'qwen/qwen3-vl-8b-instruct',
        messages: [
          {
            role: 'system',
            content: `You are a professional plumbing diagnostic AI. Analyze the customer's photo and description. Return ONLY valid JSON with this exact structure:
{
  "diagnosis": "Short description of the plumbing issue",
  "diagnosisDetailed": "Detailed explanation of what is wrong",
  "severity": "emergency" | "high" | "moderate" | "low",
  "suggestedRepairType": "Exact repair type name from our catalog",
  "estimatedLaborHours": number (e.g., 1.5),
  "partsNeeded": [{name: string, quantity: number, sellPrice: number}],
  "confidence": number (0-100)
}

IMPORTANT: Only return JSON, no other text or formatting. Be specific about the problem and the repair type name.`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: `Customer describes this issue: "${customerDescription}"\n\nPlease diagnose this plumbing problem from the photo and provide an estimate.` },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageData}` } }
            ]
          }
        ],
        max_tokens: 1000
      })
    })
    
    const visionData = await visionResponse.json()
    const aiContent = visionData.choices[0].message.content
    
    // Parse AI response
    let aiAnalysis
    try {
      aiAnalysis = JSON.parse(aiContent)
    } catch (e) {
      // If parsing fails, try to extract JSON from response
      const jsonMatch = aiContent.match(/\{[^{}]*\}/)
      if (jsonMatch) {
        aiAnalysis = JSON.parse(jsonMatch[0])
      } else {
        return new Response(JSON.stringify({ 
          error: 'Could not analyze photo clearly',
          message: 'AI could not identify the issue. A plumber will need to inspect in person.'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        })
      }
    }
    
    // Match repair type to repair_types table
    const { data: repairType } = await supabase
      .from('repair_types')
      .select('id, hourly_rate_multiplier')
      .ilike('name', aiAnalysis.suggestedRepairType || '')
      .single()
    
    // Get parts from repair_type_parts
    let partsFromDB
    if (repairType?.id) {
      const { data: parts } = await supabase
        .from('repair_type_parts')
        .select('parts_catalog_name, quantity, markup_multiplier')
        .eq('repair_type_id', repairType.id)
      
      partsFromDB = parts?.map((p: any) => ({
        ...p,
        sellPrice: p.parts_catalog_sell_price * p.markup_multiplier
      }))
    } else {
      partsFromDB = aiAnalysis.partsNeeded || []
    }
    
    // Calculate estimate
    const laborRate = companySettings.hourly_rate || 95
    const laborCost = aiAnalysis.estimatedLaborHours * laborRate
    const partsCost = partsFromDB.reduce((sum: number, p: any) => sum + (p.sellPrice || 0) * p.quantity, 0)
    const subtotal = laborCost + partsCost
    const tax = subtotal * (companySettings.tax_rate / 100)
    const total = subtotal + tax
    
    return new Response(JSON.stringify({
      diagnosis: aiAnalysis.diagnosis,
      diagnosisDetailed: aiAnalysis.diagnosisDetailed,
      aiSeverity: aiAnalysis.severity,
      aiSuggestedRepair: aiAnalysis.suggestedRepairType,
      aiEstimatedLaborHours: aiAnalysis.estimatedLaborHours,
      partsNeeded: partsFromDB.filter((p: any) => p.sellPrice > 0).map((p: any) => ({
        name: p.parts_catalog_name,
        sellPrice: p.sellPrice,
        quantity: p.quantity
      })),
      priceEstimateLow: Math.round(subtotal + tax - (subtotal * 0.1)), // 10% buffer
      priceEstimateHigh: Math.round(subtotal + tax + (subtotal * 0.15)), // 15% buffer
      confidence: aiAnalysis.confidence
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
    
  } catch (error) {
    console.error('AI Analysis Error:', error)
    return new Response(JSON.stringify({
      error: 'Analysis failed',
      message: 'We could not analyze your photo. Please try again or call us directly.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}