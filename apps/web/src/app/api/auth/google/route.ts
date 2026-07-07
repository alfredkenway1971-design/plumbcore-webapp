import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { findUserByEmail, addUser, generateId, slugify, hashPw, createSessionToken, buildSession } from '@/lib/custom-auth';
import { getAdminClient } from '@/lib/supabase-admin';

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

    let email = '';
    let name = '';
    let avatarUrl = '';

    // Try as ID token (JWT) first, fall back to access_token (OAuth2)
    try {
      const client = new OAuth2Client(googleClientId);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: googleClientId,
      });
      const payload = ticket.getPayload();
      if (payload) {
        email = (payload.email || '').toLowerCase().trim();
        name = payload.name || '';
        avatarUrl = payload.picture || '';
      }
    } catch {
      // Not a valid ID token — try as access_token via UserInfo API
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${credential}` },
        });
        if (userInfoRes.ok) {
          const info = await userInfoRes.json();
          email = (info.email || '').toLowerCase().trim();
          name = info.name || '';
          avatarUrl = info.picture || '';
        }
      } catch {
        return NextResponse.json({ error: 'Invalid Google credential' }, { status: 401 });
      }
    }

    if (!email) {
      return NextResponse.json({ error: 'Could not retrieve email from Google' }, { status: 401 });
    }

    // Fallback name if not provided
    if (!name) name = email.split('@')[0];

    // Check if user exists
    let user = await findUserByEmail(email);

    if (!user) {
      // Auto-create account for new Google sign-ins
      const id = generateId();
      const companyId = generateId();
      const companySlug = slugify(name + "'s Company");
      const randomPassword = generateId() + generateId();

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
    } else if (email === 'amer.niyonzima@gmail.com') {
      // Upgrade existing user to super_admin if not already
      if (user.role !== 'super_admin') {
        user.role = 'super_admin';
        user.subscriptionTier = 'unlimited';
        // Update the database for production
        const admin = getAdminClient();
        if (admin) {
          await (admin as any).from('auth_users').update({ role: 'super_admin' }).eq('email', email);
        }
      }
      // Ensure avatar_url and name are always updated
      if (avatarUrl) user.fullName = name;
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
