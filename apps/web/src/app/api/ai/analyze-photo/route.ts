// AI Photo Analysis API Route
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { photoBase64, companyId, customerDescription } = await request.json()
    
    // Get company settings from Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    // For now, return mock analysis (will integrate with Qwen3 VL later)
    return NextResponse.json({
      diagnosis: 'Leaking pipe or fixture detected',
      diagnosisDetailed: customerDescription || 'Customer reported a plumbing issue',
      aiSeverity: 'moderate',
      aiSuggestedRepair: 'Pipe repair or fixture replacement',
      aiEstimatedLaborHours: 1.0,
      partsNeeded: [],
      priceEstimateLow: 145,
      priceEstimateHigh: 185,
      confidence: 85
    })
    
  } catch (error) {
    console.error('AI Analysis Error:', error)
    return NextResponse.json({
      error: 'Analysis failed',
      message: 'Please try again or call us directly.'
    }, { status: 500 })
  }
}
