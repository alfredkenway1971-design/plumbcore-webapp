import { NextRequest, NextResponse } from 'next/server';
import { decodeSessionToken } from '@/lib/custom-auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = decodeSessionToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Strip internal fields before returning
    const { iat, exp, ...safeSession } = session;
    return NextResponse.json({ session: safeSession });
  } catch (err) {
    console.error('Auth check error:', err);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
