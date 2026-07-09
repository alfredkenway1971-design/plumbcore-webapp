import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';

const stripeKey = process.env.STRIPE_SECRET_KEY || '';

export async function POST(req: Request) {
  try {
    const ip = getClientIP(req);
    const rateCheck = checkRateLimit(ip, RATE_LIMITS.checkout);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateCheck.retryAfter) } }
      );
    }

    const { priceId, planName, mode, amount, description, customerEmail, customerName, customerPhone, metadata } = await req.json();

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey, { apiVersion: '2026-06-24.dahlia' as any });

    // Determine if this is a one-time deposit payment or a subscription
    const isDeposit = mode === 'payment';

    if (isDeposit) {
      // One-time deposit payment (quote page)
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: description || 'Plumbing Estimate Deposit',
              description: 'Fully refundable deposit — deducted from final bill.',
            },
            unit_amount: amount || 4900, // $49 default
          },
          quantity: 1,
        }],
        customer_email: customerEmail || undefined,
        metadata: {
          ...metadata,
          customer_name: customerName || '',
          customer_phone: customerPhone || '',
        },
        success_url: `${req.headers.get('origin') || 'https://plumbcore-ai.vercel.app'}/quote/plumbcore?payment=success`,
        cancel_url: `${req.headers.get('origin') || 'https://plumbcore-ai.vercel.app'}/quote/plumbcore?payment=cancelled`,
        allow_promotion_codes: false,
        billing_address_collection: 'auto',
      });
      return NextResponse.json({ url: session.url });
    }

    // Subscription checkout (existing flow)
    if (!priceId) {
      return NextResponse.json({ error: 'Missing priceId' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 14,
      },
      success_url: `${req.headers.get('origin') || 'https://plumbcore-ai.vercel.app'}/signup?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin') || 'https://plumbcore-ai.vercel.app'}/#pricing`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
