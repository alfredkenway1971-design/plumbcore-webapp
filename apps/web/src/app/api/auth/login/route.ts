import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, verifyPw, createSessionToken, buildSession } from '@/lib/custom-auth';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const rateResult = checkRateLimit('login:' + ip, RATE_LIMITS.login);
    if (!rateResult.allowed) {
      return NextResponse.json({ error: 'Too many attempts. Try again in ' + rateResult.retryAfter + ' seconds.' }, { status: 429, headers: { 'Retry-After': String(rateResult.retryAfter) } });
    }
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await findUserByEmail(email.toLowerCase().trim());
    if (!user || !verifyPw(password, user.passwordHash)) {
      return NextResponse.json({ error: 'Invalid login credentials' }, { status: 401 });
    }

    const session = buildSession(user);
    const token = createSessionToken(session);

    const response = NextResponse.json({ session, token });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Sign in failed. Please try again.' }, { status: 500 });
  }
}
