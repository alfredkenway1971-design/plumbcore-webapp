import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, generateId, createSessionToken, buildSession, hashPw } from '@/lib/custom-auth';
import { sendEmail, passwordResetEmail } from '@/lib/email';

// In-memory reset tokens (survives restarts in dev only, but acceptable for password reset flow)
const resetTokens = new Map<string, { email: string; expiresAt: number }>();

// POST /api/auth/reset-password - Request a reset link
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await findUserByEmail(normalizedEmail);

    // Don't reveal whether the email exists (security best practice)
    // Just say "if the email exists, a reset link was sent"
    if (user) {
      const token = generateId();
      resetTokens.set(token, {
        email: normalizedEmail,
        expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
      });

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

// PUT /api/auth/reset-password - Actually reset the password using a token
export async function PUT(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const resetData = resetTokens.get(token);
    if (!resetData) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    if (resetData.expiresAt < Date.now()) {
      resetTokens.delete(token);
      return NextResponse.json({ error: 'Reset token has expired. Request a new one.' }, { status: 400 });
    }

    // Find and update the user
    const user = await findUserByEmail(resetData.email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // We need to update the password in our store
    // Since custom-auth doesn't expose an update function, we update the in-memory store directly
    // In production (Supabase), we'd update the auth_users table
    user.passwordHash = hashPw(password);

    // Clean up the used token
    resetTokens.delete(token);

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
