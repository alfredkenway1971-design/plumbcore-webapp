import { NextResponse } from 'next/server';

/**
 * POST /api/payouts/process-weekly
 * Cron endpoint: processes weekly payouts for plumbers with 'weekly' schedule.
 * Runs via cron every Sunday.
 * 
 * For each plumber with payouts_enabled + pending payouts:
 *   Creates Stripe Connect transfer
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const expectedKey = process.env.CRON_SECRET || 'plumbcore-cron-secret';

    if (authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { getAdminClient } = await import('@/lib/supabase-admin');
    const admin = getAdminClient();

    if (!admin) {
      return NextResponse.json({ message: 'DB not configured', processed: 0 });
    }

    // Find all pending payouts for weekly-schedule plumbers
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const { data: pendingPayouts } = await (admin as any)
      .from('payouts')
      .select(`
        id, company_id, net_amount, stripe_transfer_id,
        plumber_profiles!inner(stripe_connect_account_id, stripe_onboarding_complete)
      `)
      .eq('status', 'pending')
      .gte('period_start', sevenDaysAgo.toISOString().split('T')[0]);

    if (!pendingPayouts || pendingPayouts.length === 0) {
      return NextResponse.json({ message: 'No pending payouts', processed: 0 });
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2026-06-24.dahlia' as any });

    let processed = 0;
    let failed = 0;

    for (const payout of pendingPayouts) {
      const connectAccountId = payout.plumber_profiles?.stripe_connect_account_id;
      if (!connectAccountId || !payout.plumber_profiles?.stripe_onboarding_complete) {
        console.log(`  → Skipping payout ${payout.id}: no Connect account or not onboarded`);
        continue;
      }

      try {
        // Create a transfer to the plumber's Connect account
        const transfer = await stripe.transfers.create({
          amount: payout.net_amount,
          currency: 'usd',
          destination: connectAccountId,
          description: `Weekly payout ${payout.id}`,
        });

        await (admin as any)
          .from('payouts')
          .update({
            status: 'processing',
            stripe_transfer_id: transfer.id,
            updated_at: now.toISOString(),
          })
          .eq('id', payout.id);

        processed++;
        console.log(`  → Transfer ${transfer.id}: $${(payout.net_amount / 100).toFixed(2)} to ${connectAccountId}`);
      } catch (err: any) {
        console.error(`  → Failed to process payout ${payout.id}:`, err.message);
        await (admin as any)
          .from('payouts')
          .update({
            status: 'failed',
            notes: err.message,
            updated_at: now.toISOString(),
          })
          .eq('id', payout.id);
        failed++;
      }
    }

    return NextResponse.json({
      message: `Processed ${processed} payouts${failed ? `, ${failed} failed` : ''}`,
      processed,
      failed,
    });
  } catch (err: any) {
    console.error('Process weekly payouts error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
