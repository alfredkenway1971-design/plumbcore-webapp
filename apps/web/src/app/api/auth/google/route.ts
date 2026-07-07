import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { findUserByEmail, addUser, generateId, slugify, hashPw, createSessionToken, buildSession } from '@/lib/custom-auth';

const googleClientId = process.env.GOOGLE_CLIENT_ID || '';

// POST /api/auth/google — Verify Google credential and create/login user
export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json({ error: 'Missing Google credential' }, { status: 400 });
    }

    if (!googleClientId) {
      console.error('GOOGLE_CLIENT_ID not configured');
      return NextResponse.json({ error: 'Google sign-in not configured' }, { status: 500 });
    }

    // Verify the Google ID token
    const client = new OAuth2Client(googleClientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Invalid Google token' }, { status: 401 });
    }

    const email = payload.email.toLowerCase().trim();
    const name = payload.name || email.split('@')[0];
    const avatarUrl = payload.picture || '';

    // Check if user exists
    let user = await findUserByEmail(email);

    if (!user) {
      // Auto-create account for new Google sign-ins
      const id = generateId();
      const companyId = generateId();
      const companySlug = slugify(name + "'s Company");
      const randomPassword = generateId() + generateId(); // Random password (they'll use Google)

      user = {
        id,
        email,
        passwordHash: hashPw(randomPassword),
        fullName: name,
        companyName: name + "'s Company",
        companySlug,
        companyId,
        phone: '',
        role: email === 'amer.niyonzima@gmail.com' ? 'super_admin' : 'admin',
        stripeCustomerId: '',
        stripeSubscriptionId: '',
        subscriptionTier: email === 'amer.niyonzima@gmail.com' ? 'unlimited' : '',
      };

      await addUser(user);
    }

    // Create session
    const session = buildSession(user);
    if (avatarUrl && session.profile) {
      (session.profile as any).avatar_url = avatarUrl;
    }

    const token = createSessionToken(session);

    const response = NextResponse.json({ session, token, isNewUser: !user.stripeCustomerId });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err: any) {
    console.error('Google auth error:', err);
    return NextResponse.json({ error: 'Google sign-in failed' }, { status: 500 });
  }
}
