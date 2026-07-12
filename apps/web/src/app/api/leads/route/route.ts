/**
 * GET /api/leads/route
 * Returns all active leads for a plumber
 * POST /api/leads/route
 * Triggers routing for a new lead
 */

import { NextResponse } from 'next/server';
import { findTopPlumbers, ROUTING_CONFIG } from '@/lib/lead-routing';
import { getAdminClient } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/email';
import { sendSms, leadSmsTemplate } from '@/lib/sms';

export async function GET(req: Request) {
  try {
    const admin = getAdminClient();
    if (!admin) return NextResponse.json({ leads: [] });

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');

    let query = (admin as any).from('leads').select('*').order('created_at', { ascending: false }).limit(50);
    if (companyId) query = query.eq('accepted_by', companyId);

    const { data: leads, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ leads: leads || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { leadId } = await req.json();
    if (!leadId) return NextResponse.json({ error: 'Missing leadId' }, { status: 400 });

    const admin = getAdminClient();
    if (!admin) return NextResponse.json({ error: 'DB not configured' }, { status: 500 });

    // Get lead data
    const { data: lead, error: leadErr } = await (admin as any)
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadErr || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Get all active plumbers
    const { data: plumbers } = await (admin as any)
      .from('companies')
      .select('id, slug, name, email, phone, lat, lng, plan_tier, rating, active_jobs, max_jobs, avg_response_minutes')
      .eq('status', 'active')
      .not('lat', 'is', null)
      .not('lng', 'is', null);

    if (!plumbers || plumbers.length === 0) {
      return NextResponse.json({ message: 'No plumbers available' }, { status: 200 });
    }

    // Use a default location if lead has no lat/lng (NYC center)
    const leadLat = lead.customer_lat || 40.7128;
    const leadLng = lead.customer_lng || -74.006;

    // Find top plumbers within 25 miles
    const topPlumbers = findTopPlumbers(
      plumbers,
      leadLat,
      leadLng,
      ROUTING_CONFIG.initialRadius,
      ROUTING_CONFIG.notifyCount
    );

    if (topPlumbers.length === 0) {
      console.log(`  → No plumbers within ${ROUTING_CONFIG.initialRadius}mi — expanding to ${ROUTING_CONFIG.expandedRadius}mi`);
      // Expand radius
      const expanded = findTopPlumbers(
        plumbers,
        leadLat,
        leadLng,
        ROUTING_CONFIG.expandedRadius,
        ROUTING_CONFIG.notifyCount
      );
      if (expanded.length === 0) {
        console.log('  → No plumbers available in expanded radius');
        return NextResponse.json({ message: 'No plumbers available in range' }, { status: 200 });
      }
      return await notifyPlumbers(admin, lead, expanded, 'expanded');
    }

    return await notifyPlumbers(admin, lead, topPlumbers, 'initial');
  } catch (err: any) {
    console.error('Lead routing error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function notifyPlumbers(admin: any, lead: any, scored: any[], round: string) {
  const notified: string[] = [];
  const now = new Date();
  const timerExpires = new Date(now.getTime() + ROUTING_CONFIG.acceptTimerMinutes * 60 * 1000);

  for (const { plumber, score, distance } of scored) {
    try {
      // Create notification record
      await (admin as any).from('lead_notifications').insert({
        lead_id: lead.id,
        company_id: plumber.id,
        score,
        distance: Math.round(distance),
        round,
        status: 'sent',
        expires_at: timerExpires.toISOString(),
      });

      // Send email notification to plumber
      const estimateStr = lead.total_estimate ? `$${lead.total_estimate.toFixed(2)}` : 'N/A';
      await sendEmail({
        to: plumber.email,
        subject: `🔔 New lead: ${lead.customer_name} — ${lead.diagnosis}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3B82F6, #06B6D4); padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 20px;">New Lead Available 🔔</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 13px;">${ROUTING_CONFIG.acceptTimerMinutes} minutes to accept</p>
            </div>
            <div style="padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
              <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; color: #64748b;">Customer:</td><td style="font-weight: 600;">${lead.customer_name}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;">Address:</td><td>${lead.customer_address || 'N/A'}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;">Issue:</td><td>${lead.diagnosis}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;">Estimate:</td><td style="font-weight: 600;">${estimateStr}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;">Distance:</td><td>${Math.round(distance)} mi</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;">Score:</td><td>${score}/100</td></tr>
              </table>
              <a href="https://plumbcore-ai.vercel.app/leads?accept=${lead.id}" style="display: inline-block; margin-top: 16px; padding: 12px 32px; background: #10B981; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Accept Lead</a>
              <a href="https://plumbcore-ai.vercel.app/leads?decline=${lead.id}" style="display: inline-block; margin-top: 16px; margin-left: 8px; padding: 12px 24px; background: #EF4444; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Decline</a>
            </div>
          </div>
        `,
      });

      notified.push(plumber.id);
      console.log(`  → Notified ${plumber.name} (${plumber.email}) — score: ${score}`);

      // Also send SMS if phone available
      if (plumber.phone) {
        const smsBody = leadSmsTemplate({
          customerName: lead.customer_name,
          address: lead.customer_address || 'N/A',
          estimate: lead.total_estimate || 0,
          diagnosis: lead.diagnosis,
          leadId: lead.id,
        });
        await sendSms(plumber.phone, smsBody);
      }
    } catch (err: any) {
      console.error(`  → Failed to notify ${plumber.email}:`, err.message);
    }
  }

  return NextResponse.json({
    notified: notified.length,
    round,
    plumbers: scored.map(s => ({ name: s.plumber.name, score: s.score, distance: Math.round(s.distance) })),
  });
}
