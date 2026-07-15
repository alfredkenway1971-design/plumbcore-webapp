import { NextResponse } from 'next/server';

/**
 * POST /api/leads/create-from-session
 * Creates a lead from a successful Stripe checkout session.
 * This bypasses the Stripe webhook and creates the lead immediately
 * when the customer is redirected back to the success page.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, estimate, deposit, diagnosis, customerName, customerPhone, customerEmail, customerCity, customerAddress, trackingToken } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const { getAdminClient } = await import('@/lib/supabase-admin');
    const admin = getAdminClient();

    if (!admin) {
      // No DB available — return the tracking data anyway
      return NextResponse.json({
        leadId: null,
        trackingToken: trackingToken || null,
        message: 'Database not available. Lead will be created when webhook processes.',
      });
    }

    // Check if lead already exists for this session
    try {
      const { data: existing } = await (admin as any)
        .from('leads')
        .select('id, tracking_token')
        .eq('stripe_session_id', sessionId)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ leadId: existing.id, trackingToken: existing.tracking_token || trackingToken });
      }
    } catch {
      // Table might not exist — continue
    }

    // Create the lead
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    try {
      const { data: lead, error } = await (admin as any)
        .from('leads')
        .insert({
          stripe_session_id: sessionId,
          customer_name: customerName || '',
          customer_email: customerEmail || '',
          customer_phone: customerPhone || '',
          customer_city: customerCity || '',
          customer_address: customerAddress || '',
          diagnosis: diagnosis || '',
          severity: 'moderate',
          total_estimate: estimate || 0,
          deposit_paid: (deposit || 0) / 100, // Convert cents to dollars
          status: 'matching',
          tracking_token: trackingToken || null,
          created_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .select('id, tracking_token')
        .single();

      if (error) {
        console.error('[/api/leads/create-from-session] Insert error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log(`✅ Lead created directly: ${lead.id} (tracking: ${lead.tracking_token})`);

      // Trigger routing asynchronously
      const routingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://plumbcore-ai.vercel.app'}/api/leads/route`;
      fetch(routingUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id }),
      }).catch(() => {});

      return NextResponse.json({ leadId: lead.id, trackingToken: lead.tracking_token || trackingToken });
    } catch (dbErr: any) {
      console.error('[/api/leads/create-from-session] DB error:', dbErr.message);
      return NextResponse.json({
        leadId: null,
        trackingToken: trackingToken || null,
        message: 'Lead queued for creation',
      });
    }
  } catch (err: any) {
    console.error('[/api/leads/create-from-session] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
