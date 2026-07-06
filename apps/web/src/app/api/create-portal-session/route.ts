import { NextResponse } from 'next/server';

const stripeKey = process.env.STRIPE_SECRET_KEY || '';

export async function POST(req: Request) {
  try {
    const { customerId, returnUrl } = await req.json();

    if (!customerId) {
      return NextResponse.json({ error: 'Missing customerId' }, { status: 400 });
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey, { apiVersion: '2026-06-24.dahlia' as any });

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${req.headers.get('origin') || 'http://localhost:3001'}/billing`,
      configuration: 'bpc_1TqGDzD0AAcByeQ96vg3vJNS',
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Portal session error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create portal session' }, { status: 500 });
  }
}
