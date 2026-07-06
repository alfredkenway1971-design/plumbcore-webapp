import { NextRequest, NextResponse } from 'next/server';
import { hashPw, createSessionToken, generateId, slugify, addUser, findUserByEmail, buildSession } from '@/lib/custom-auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, companyName, phone, sessionId } = await request.json();

    if (!email || !password || !fullName || !companyName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existing = await findUserByEmail(normalizedEmail);
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists. Sign in instead.' }, { status: 409 });
    }

    // Look up Stripe subscription if sessionId was provided from checkout
    let stripeCustomerId = '';
    let stripeSubscriptionId = '';
    let subscriptionTier = 'solo';

    if (sessionId) {
      try {
        const stripeKey = process.env.STRIPE_SECRET_KEY || '';
        if (stripeKey) {
          const Stripe = (await import('stripe')).default;
          const stripe = new Stripe(stripeKey, { apiVersion: '2026-06-24.dahlia' as any });

          const session = await stripe.checkout.sessions.retrieve(sessionId);
          if (session) {
            stripeCustomerId = session.customer as string || '';
            stripeSubscriptionId = session.subscription as string || '';

            // Look up subscription to get the price/plan
            if (stripeSubscriptionId) {
              const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
              const priceId = subscription.items.data[0]?.price?.id || '';
              // Map price IDs to plan names
              const priceMap: Record<string, string> = {
                'price_1TqFwHD0AAcByeQ9qNUaikbx': 'solo',
                'price_1TqFwOD0AAcByeQ94DnPlHr1': 'team',
                'price_1TqFwPD0AAcByeQ9SjTdf8VF': 'pro',
                'price_1TqFwVD0AAcByeQ90c6KWdEJ': 'business',
                'price_1TqFwXD0AAcByeQ9vJ2OGA8G': 'enterprise',
              };
              subscriptionTier = priceMap[priceId] || 'solo';
            }
          }
        }
      } catch (stripeErr) {
        console.error('Stripe lookup failed (non-fatal):', stripeErr);
      }
    }

    const id = generateId();
    const companyId = generateId();
    const companySlug = slugify(companyName);

    const user = {
      id,
      email: normalizedEmail,
      passwordHash: hashPw(password),
      fullName: fullName.trim(),
      companyName: companyName.trim(),
      companySlug,
      companyId,
      phone: phone || '',
      role: 'admin',
      stripeCustomerId,
      stripeSubscriptionId,
      subscriptionTier,
    };

    await addUser(user);
    const session = buildSession(user);
    const token = createSessionToken(session);

    const response = NextResponse.json({ session, token }, { status: 201 });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Sign up failed. Please try again.' }, { status: 500 });
  }
}
