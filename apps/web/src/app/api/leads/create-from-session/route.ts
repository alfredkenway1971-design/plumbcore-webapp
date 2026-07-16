import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const { getAdminClient } = await import('@/lib/supabase-admin');
    const admin = getAdminClient();

    // Check if lead exists
    if (admin) {
      const { data: existing } = await (admin as any)
        .from('leads')
        .select('id')
        .eq('stripe_session_id', sessionId)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ 
          leadId: existing.id,
          message: 'Lead already exists'
        });
      }
    }

    // Fetch session from Stripe to get metadata
    const stripeKey = process.env.STRIPE_SECRET_KEY || '';
    if (!stripeKey) {
      console.error('STRIPE_SECRET_KEY not configured');
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey, { apiVersion: '2026-06-24.dahlia' as any });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const metadata = session.metadata || {};
    const isDeposit = session.mode === 'payment';

    if (!isDeposit) {
      return NextResponse.json({ error: 'Not a deposit payment' }, { status: 400 });
    }

    const amountPaid = (session.amount_total || 4900) / 100;
    const depositCharged = parseInt(metadata.depositCharged || '4900');
    
    // Create lead in marketplace
    if (admin) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      const { data: lead, error } = await (admin as any)
        .from('leads')
        .insert({
          stripe_session_id: sessionId,
          customer_name: metadata.customer_name || session.customer_details?.name || 'Unknown',
          customer_email: session.customer_details?.email || '',
          customer_phone: metadata.customer_phone || '',
          customer_address: metadata.customerAddress || '',
          customer_city: metadata.customerCity || '',
          diagnosis: metadata.diagnosis || '',
          severity: metadata.severity || 'moderate',
          total_estimate: parseFloat(metadata.totalEstimate || '0'),
          deposit_paid: amountPaid,
          deposit_charged: depositCharged / 100,
          deposit_tier: metadata.depositTier || '',
          tracking_token: metadata.trackingToken || null,
          estimated_job_value: parseFloat(metadata.totalEstimate || '0'),
          status: 'matching',
          created_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        console.error('Lead creation error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (lead) {
        console.log(`✅ Lead created: ${lead.id}`);
        
        // Trigger routing
        const routingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://plumbcore-ai.vercel.app'}/api/leads/route`;
        fetch(routingUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId: lead.id }),
        }).catch(err => console.error('Routing error:', err.message));

        return NextResponse.json({ leadId: lead.id });
      }
    }

    return NextResponse.json({ error: 'No database available' }, { status: 500 });
  } catch (err: any) {
    console.error('/api/leads/create-from-session error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
