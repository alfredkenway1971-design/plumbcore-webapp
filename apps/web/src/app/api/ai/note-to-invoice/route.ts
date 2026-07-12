import { NextRequest, NextResponse } from 'next/server';
import { transcribeNoteToInvoice } from '@/lib/ai-client';
import { requireAuth } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { note } = body;

    if (!note) {
      return NextResponse.json({ error: 'No note text provided' }, { status: 400 });
    }

    const result = await transcribeNoteToInvoice(note);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Note-to-invoice error:', error);
    return NextResponse.json(
      { error: error.message || 'Transcription failed' },
      { status: 500 }
    );
  }
}