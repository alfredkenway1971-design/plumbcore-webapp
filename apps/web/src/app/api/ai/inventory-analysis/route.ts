import { NextRequest, NextResponse } from 'next/server';
import { inventoryAnalysis } from '@/lib/ai-client';
import { requireAuth } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

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