import { NextResponse } from 'next/server';

/**
 * POST /api/stripe/create-connect-account
 * Creates a Stripe Connect Express account for a plumber
 */
export async function POST(req: Request) {
  try {
    const { companyId, email, companyName, phone } = await req.json();
    if (!companyId || !email) {
      return NextResponse.json({ error: 'companyId and email required' }, { status: 400 });
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2026-06-24.dahlia' as any });

    // Create Connect Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email,
      business_type: 'individual',
      business_profile: {
        name: companyName || email,
        url: `https://plumbcore-ai.vercel.app/plumber/${companyId}`,
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Generate onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'https://plumbcore-ai.vercel.app/plumber/earnings?refresh=true',
      return_url: 'https://plumbcore-ai.vercel.app/plumber/earnings?success=true',
      type: 'account_onboarding',
    });

    // Update plumber_profile in DB
    const { getAdminClient } = await import('@/lib/supabase-admin');
    const admin = getAdminClient();
    if (admin) {
      await (admin as any)
        .from('plumber_profiles')
        .update({
          stripe_connect_account_id: account.id,
          stripe_onboarding_url: accountLink.url,
        })
        .eq('company_id', companyId);
    }

    return NextResponse.json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
    });
  } catch (err: any) {
    console.error('Failed to create Connect account:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
