/**
 * PATCH /api/leads/[lead-id]
 * Accept or decline a lead
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { getAdminClient } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/email';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ 'lead-id': string }> },
) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { 'lead-id': leadId } = await params;
    const { action, companyId, reason } = await req.json();

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const admin = getAdminClient();
    if (!admin) return NextResponse.json({ error: 'DB not configured' }, { status: 500 });

    // Get the lead
    const { data: lead } = await (admin as any)
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    if (lead.status !== 'pending') {
      return NextResponse.json({ error: `Lead already ${lead.status}` }, { status: 409 });
    }

    if (action === 'accept') {
      // Accept: mark lead as accepted, create job
      const { data: company } = await (admin as any)
        .from('companies')
        .select('id, name, email')
        .eq('id', companyId)
        .single();

      if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });

      await (admin as any).from('leads').update({
        status: 'accepted',
        accepted_by: companyId,
        accepted_at: new Date().toISOString(),
      }).eq('id', leadId);

      // Create the job
      await (admin as any).from('jobs').insert({
        company_id: companyId,
        customer_name: lead.customer_name,
        customer_email: lead.customer_email,
        customer_phone: lead.customer_phone,
        customer_address: lead.customer_address,
        diagnosis: lead.diagnosis,
        severity: lead.severity,
        total_estimate: lead.total_estimate,
        deposit_paid: lead.deposit_paid,
        deposit_stripe_id: lead.stripe_session_id,
        status: 'deposit_paid',
      });

      // Notify all other notified plumbers that lead was taken
      await (admin as any).from('lead_notifications').update({
        status: 'taken',
      }).eq('lead_id', leadId).neq('company_id', companyId);

      console.log(`✅ Lead ${leadId} accepted by ${company.name}`);

      return NextResponse.json({ success: true, message: `Lead accepted by ${company.name}` });
    }

    if (action === 'decline') {
      // Record the decline
      await (admin as any).from('lead_notifications').insert({
        lead_id: leadId,
        company_id: companyId,
        status: 'declined',
        decline_reason: reason || 'Not specified',
      });

      console.log(`❌ Lead ${leadId} declined by company ${companyId}: ${reason || 'No reason'}`);

      return NextResponse.json({ success: true, message: 'Decline recorded' });
    }
  } catch (err: any) {
    console.error('Lead action error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
