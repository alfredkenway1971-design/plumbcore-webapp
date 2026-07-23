import { NextRequest, NextResponse } from 'next/server';
import { chatWithAI } from '@/lib/ai-client';
import { requireAuth, AuthenticatedRequest } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const authedReq = auth as AuthenticatedRequest;

  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array required' }, { status: 400 });
    }

    const reply = await chatWithAI(messages);
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('AI chat error:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Chat failed' },
      { status: 500 }
    );
  }
}