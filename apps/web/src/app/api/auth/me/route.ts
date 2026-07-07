import { NextRequest, NextResponse } from 'next/server';
import { decodeSessionToken } from '@/lib/custom-auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false, session: null });
    }

    const session = decodeSessionToken(token);
    if (!session) {
      return NextResponse.json({ authenticated: false, session: null });
    }

    // Strip internal fields before returning
    const { iat, exp, ...safeSession } = session;
    return NextResponse.json({ session: safeSession });
  } catch (err) {
    console.error('Auth check error:', err);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
