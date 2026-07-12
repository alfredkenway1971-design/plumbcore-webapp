import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, generateId, createSessionToken, buildSession, hashPw } from '@/lib/custom-auth';
import { sendEmail, passwordResetEmail } from '@/lib/email';
import { createHmac, randomBytes } from 'crypto';

const authSecret = process.env.AUTH_SECRET || '';

// Self-contained reset token: HMAC(email + expiry, secret)
// No server-side storage needed — works on serverless (Vercel)
function generateResetToken(email: string): { token: string; expiry: number } {
  const expiry = Date.now() + 60 * 60 * 1000; // 1 hour
  const payload = `${email}:${expiry}`;
  const hmac = createHmac('sha256', authSecret).update(payload).digest('hex');
  return { token: `${Buffer.from(payload).toString('base64url')}.${hmac}`, expiry };
}

function verifyResetToken(token: string): { email: string; valid: boolean } {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return { email: '', valid: false };
    const payload = Buffer.from(parts[0], 'base64url').toString();
    const [email, expiryStr] = payload.split(':');
    const expiry = parseInt(expiryStr, 10);
    if (isNaN(expiry) || expiry < Date.now()) return { email: '', valid: false };
    const expectedHmac = createHmac('sha256', authSecret).update(payload).digest('hex');
    if (parts[1] !== expectedHmac) return { email: '', valid: false };
    return { email, valid: true };
  } catch {
    return { email: '', valid: false };
  }
}

// POST /api/auth/reset-password — Request a reset link
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await findUserByEmail(normalizedEmail);

    if (user) {
      const { token } = generateResetToken(normalizedEmail);
      const resetLink = 'https://plumbcore-ai.vercel.app/reset-password?token=' + token;
      const emailContent = passwordResetEmail(resetLink);
      await sendEmail({
        to: normalizedEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    }

    return NextResponse.json({
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  } catch (err) {
    console.error('Password reset request error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// PUT /api/auth/reset-password — Actually reset the password using a token
export async function PUT(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const { email, valid } = verifyResetToken(token);
    if (!valid || !email) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    // Find and update the user
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.passwordHash = hashPw(password);

    // Generate new session
    const session = buildSession(user);
    const newToken = createSessionToken(session);

    const response = NextResponse.json({ success: true, message: 'Password reset successfully' });
    response.cookies.set('auth_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Password reset error:', err);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
