import { NextResponse } from 'next/server';

/**
 * GET /api/leads/by-session?session_id=xxx
 * Returns the lead ID for a given Stripe checkout session ID.
 * Used by the quote success page to show the correct tracking link.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    const { getAdminClient } = await import('@/lib/supabase-admin');
    const admin = getAdminClient();

    if (admin) {
      // Try DB first
      try {
        const { data: lead } = await (admin as any)
          .from('leads')
          .select('id')
          .eq('stripe_session_id', sessionId)
          .single();
        if (lead) {
          return NextResponse.json({ leadId: lead.id });
        }
      } catch {
        // Table might not exist, fall through
      }

      // Try jobs table too
      try {
        const { data: job } = await (admin as any)
          .from('jobs')
          .select('id')
          .eq('deposit_stripe_id', sessionId)
          .single();
        if (job) {
          return NextResponse.json({ leadId: job.id });
        }
      } catch {
        // fall through
      }
    }

    // Return a generic response — the page will use a placeholder link
    return NextResponse.json({ leadId: null, message: 'Lead not yet created. The webhook may still be processing.' });
  } catch (err: any) {
    console.error('[/api/leads/by-session] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
