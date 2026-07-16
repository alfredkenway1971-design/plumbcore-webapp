import { NextRequest, NextResponse } from 'next/server';
import * as cookieService from '@/lib/cookies';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    // Try Bearer token first
    let token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    // Fallback to cookies
    if (!token) {
      token = cookieService.getAuthToken(request);
    }
    
    if (!token) {
      console.log('⚠️ Auth check: No token found (no header, no cookie)');
      return NextResponse.json({ 
        authenticated: false, 
        session: null,
        debug: {
          hasHeader: !!authHeader,
          hasCookie: !!token
        }
      });
    }

    const { decodeSessionToken } = await import('@/lib/custom-auth');
    const session = decodeSessionToken(token);
    
    if (!session) {
      console.log('⚠️ Auth check: Token decoding failed');
      return NextResponse.json({ 
        authenticated: false, 
        session: null,
        error: 'Token decode failed'
      });
    }

    // Strip internal fields before returning
    const { iat, exp, ...safeSession } = session;
    
    console.log('✅ Auth check successful for user:', safeSession.user?.email);
    return NextResponse.json({ 
      authenticated: true, 
      session: safeSession 
    });
    
  } catch (err: any) {
    console.error('❌ Auth check error:', err.message);
    return NextResponse.json({ 
      error: 'Authentication failed',
      details: err.message 
    }, { status: 500 });
  }
}
