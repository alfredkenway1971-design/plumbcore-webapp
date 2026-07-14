import { NextResponse } from 'next/server';

/**
 * POST /api/leads/refund
 *
 * Initiates an auto-refund when no plumber is found within the timeout window.
 * Called by cron/webhook.
 *
 * Body: { leadId: string }
 */
export async function POST(req: Request) {
  try {
    const { leadId } = await req.json();

    if (!leadId) {
      return NextResponse.json({ error: 'Missing leadId' }, { status: 400 });
    }

    const { processRefund } = await import('@/lib/lead-routing');
    const { getAdminClient } = await import('@/lib/supabase-admin');
    const admin = getAdminClient();

    const result = await processRefund(leadId, admin);

    if (result.status === 'refunded') {
      console.log(`[Refund] Lead ${leadId} — refund processed successfully`);
      return NextResponse.json({
        status: 'refunded',
        refundId: result.refundId,
        message: 'Deposit has been refunded',
      });
    }

    console.error(`[Refund] Lead ${leadId} — refund failed:`, result.error);
    return NextResponse.json(
      { status: result.status, error: result.error || 'Refund processing failed' },
      { status: 500 },
    );
  } catch (err: any) {
    console.error('[/api/leads/refund] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
