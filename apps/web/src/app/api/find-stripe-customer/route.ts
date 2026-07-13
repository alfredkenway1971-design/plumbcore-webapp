import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';

const stripeKey = process.env.STRIPE_SECRET_KEY || '';

export async function GET(req: Request) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey, { apiVersion: '2026-06-24.dahlia' as any });

    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json({ customerId: null });
    }

    return NextResponse.json({ customerId: customers.data[0].id });
  } catch (err: any) {
    console.error('Find customer error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
