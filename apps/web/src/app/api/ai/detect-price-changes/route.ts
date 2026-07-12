import { NextRequest, NextResponse } from 'next/server';
import { detectPriceChanges } from '@/lib/ai-client';
import { requireAuth } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Items array required' }, { status: 400 });
    }

    const result = await detectPriceChanges(items);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Price detection error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}