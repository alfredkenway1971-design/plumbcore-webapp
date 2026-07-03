import { NextRequest, NextResponse } from 'next/server';
import { inventoryAnalysis } from '@/lib/ai-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { inventory } = body;

    if (!inventory || !Array.isArray(inventory)) {
      return NextResponse.json({ error: 'Inventory array required' }, { status: 400 });
    }

    const result = await inventoryAnalysis(inventory);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Inventory analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}