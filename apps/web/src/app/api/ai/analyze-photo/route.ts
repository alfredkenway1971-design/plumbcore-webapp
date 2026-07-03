import { NextRequest, NextResponse } from 'next/server';
import { analyzePlumbingPhoto } from '@/lib/ai-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const result = await analyzePlumbingPhoto(image);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Photo analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}