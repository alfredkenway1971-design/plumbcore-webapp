import { NextResponse } from 'next/server';

/**
 * POST /api/leads/route
 *
 * Initiates lead routing: finds the best plumbers, notifies #1, sets up timers.
 * Called by the Stripe webhook after a deposit is confirmed.
 *
 * Body: { leadId: string }
 */
export async function POST(req: Request) {
  try {
    const { leadId } = await req.json();

    if (!leadId) {
      return NextResponse.json({ error: 'Missing leadId' }, { status: 400 });
    }

    const { getAdminClient } = await import('@/lib/supabase-admin');
    const admin = getAdminClient();

    if (!admin) {
      // No Supabase configured — use mock routing
      const { routeLead } = await import('@/lib/lead-routing');
      const mockLead = {
        id: leadId,
        customerAddress: '123 Main St',
        customerCity: 'Austin',
        estimatedJobValue: 500,
        depositAmount: 49,
        depositTier: 'Under $1,000',
        diagnosis: 'Leaky faucet',
        severity: 'moderate',
        customerName: 'Test Customer',
        customerPhone: '(555) 123-4567',
        customerEmail: 'customer@example.com',
      };
      const result = await routeLead(mockLead, null);
      return NextResponse.json(result);
    }

    // Fetch lead from database
    const { data: lead, error } = await (admin as any)
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (error || !lead) {
      return NextResponse.json({ error: 'Lead not found', details: error?.message }, { status: 404 });
    }

    const { routeLead } = await import('@/lib/lead-routing');

    const leadData = {
      id: lead.id,
      customerAddress: lead.customer_address || '',
      customerCity: lead.customer_city || 'Austin',
      estimatedJobValue: lead.estimated_job_value || lead.total_estimate || 0,
      depositAmount: lead.deposit_paid || 0,
      depositTier: lead.deposit_tier || '',
      diagnosis: lead.diagnosis || '',
      severity: lead.severity || '',
      customerName: lead.customer_name || 'Customer',
      customerPhone: lead.customer_phone || '',
      customerEmail: lead.customer_email || '',
      stripeSessionId: lead.stripe_session_id || '',
    };

    // Update lead status to 'routing'
    await (admin as any)
      .from('leads')
      .update({ status: 'routing', updated_at: new Date().toISOString() })
      .eq('id', leadId);

    // DEBUG: Test auth_users query from this exact code location
    const { data: testPlumbers, error: testError } = await (admin as any)
      .from('auth_users')
      .select('id, full_name, email, role')
      .in('role', ['tech', 'admin'])
      .limit(50);
    console.log('[DEBUG] auth_users test:', testPlumbers?.length || 0, 'plumbers, error:', testError?.message || 'none');

    const result = await routeLead(leadData, admin);

    // Add debug info to response
    return NextResponse.json({
      ...result,
      _debug: {
        testPlumbersCount: testPlumbers?.length || 0,
        testError: testError?.message || null,
        adminExists: !!admin,
        supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY || !!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE,
      }
    });
  } catch (err: any) {
    console.error('[/api/leads/route] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
