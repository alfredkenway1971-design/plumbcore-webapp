/**
 * POST /api/admin/leads/assign
 * Admin assigns a lead to a plumber → creates job → sends notification
 */
import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase-admin';

async function sendSmsNotification(phone: string, message: string) {
  try {
    const { sendSms } = await import('@/lib/sms');
    await sendSms(phone, message);
  } catch (e) {
    console.error('SMS notification failed (non-blocking):', e);
  }
}

export async function POST(req: Request) {
  try {
    const { leadId, plumberId, plumberName, mode } = await req.json();

    if (!leadId || !plumberId) {
      return NextResponse.json({ error: 'leadId and plumberId required' }, { status: 400 });
    }

    const admin = getAdminClient();
    if (!admin) {
      return NextResponse.json({ error: 'DB not configured' }, { status: 500 });
    }

    const sb = admin as any;

    // Get the lead details
    const { data: lead } = await sb
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Get the plumber's phone for notification
    const { data: plumber } = await sb
      .from('profiles')
      .select('phone, full_name')
      .eq('id', plumberId)
      .single();

    // 1. Update the lead with assigned plumber
    const { error } = await sb
      .from('leads')
      .update({
        assigned_plumber_id: plumberId,
        assigned_plumber_name: plumberName || '',
        status: 'assigned',
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId);

    if (error) {
      console.error('Lead assignment error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 2. Auto-create a job from the lead
    try {
      await sb.from('jobs').insert({
        company_id: plumberId,
        customer_name: lead.customer_name || 'Unknown',
        customer_email: lead.customer_email || '',
        customer_phone: lead.customer_phone || '',
        customer_address: lead.customer_address || '',
        diagnosis: lead.diagnosis || '',
        severity: lead.severity || 'moderate',
        total_estimate: lead.total_estimate || 0,
        deposit_paid: lead.deposit_paid || 0,
        deposit_stripe_id: lead.stripe_session_id || '',
        status: 'assigned',
        created_at: new Date().toISOString(),
      });
      console.log(`✅ Job created for lead ${leadId}`);
    } catch (jobErr) {
      console.error('Job creation failed (non-blocking):', jobErr);
    }

    // 3. Send SMS notification to the plumber
    if (plumber?.phone) {
      const customerInfo = [
        lead.customer_name,
        lead.customer_address,
        lead.diagnosis ? `Issue: ${lead.diagnosis.substring(0, 60)}` : '',
      ].filter(Boolean).join(' — ');

      const msg = `🔧 New job assigned!\n${customerInfo}\nEst: $${lead.total_estimate || 'TBD'}\nDeposit: $${lead.deposit_paid || 0}`;

      // Fire and forget
      sendSmsNotification(plumber.phone, msg);
    }

    return NextResponse.json({
      success: true,
      message: `Lead assigned to ${plumberName || plumberId}`,
      mode: mode || 'manual',
      jobCreated: true,
    });
  } catch (err: any) {
    console.error('Assign error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
