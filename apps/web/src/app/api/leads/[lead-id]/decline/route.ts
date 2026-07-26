import { NextResponse } from 'next/server';

/**
 * POST /api/leads/[lead-id]/decline
 *
 * Called by a plumber to decline a lead.
 * Triggers routing to the next plumber.
 *
 * Body: { plumberId: string; reason?: string }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ 'lead-id': string }> },
) {
  try {
    const { 'lead-id': leadId } = await params;
    const { plumberId, reason } = await req.json();

    if (!leadId || !plumberId) {
      return NextResponse.json(
        { error: 'Missing required fields: leadId, plumberId' },
        { status: 400 },
      );
    }

    const { handlePlumberDecline } = await import('@/lib/lead-routing');
    const { getAdminClient } = await import('@/lib/supabase-admin');
    const admin = getAdminClient();

    // Update plumber's decline count in DB
    if (admin) {
      try {
        await (admin as any).rpc('increment_plumber_decline_count', {
          p_plumber_id: plumberId,
        }).catch(() => {
          // Fallback: direct update
          (admin as any)
            .from('plumber_profiles')
            .update({
              decline_count: (admin as any).raw('decline_count + 1'),
              updated_at: new Date().toISOString(),
            })
            .eq('id', plumberId)
            .catch(() => {});
        });
      } catch {
        // Non-critical
      }
    }

    const result = await handlePlumberDecline(leadId, plumberId, reason);

    if (result.status === 'expand_needed') {
      // Trigger expand
      console.log(`[Decline] Lead ${leadId} needs radius expansion — triggering`);
      if (admin) {
        // Notify the expire endpoint to handle expansion
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://plumbcore-ai.vercel.app';
        fetch(`${appUrl}/api/leads/expire`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId }),
        }).catch(() => {});
      }
    }

    return NextResponse.json({
      status: result.status,
      nextPlumber: result.nextPlumber
        ? {
            plumberId: result.nextPlumber.plumberId,
            companyName: result.nextPlumber.companyName,
          }
        : null,
      message:
        result.status === 'refunded'
          ? 'All plumbers declined — auto-refund initiated'
          : result.status === 'expand_needed'
            ? 'All plumbers declined at current radius — expanding search area'
            : 'Decline recorded, routing to next plumber',
    });
  } catch (err: any) {
    console.error('[/api/leads/[lead-id]/decline] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * GET handler — plumber clicks Decline in email
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ 'lead-id': string }> },
) {
  try {
    const { 'lead-id': leadId } = await params;
    const url = new URL(req.url);
    const plumberId = url.searchParams.get('plumberId') || '';

    const { getAdminClient } = await import('@/lib/supabase-admin');
    const admin = getAdminClient();

    // Try to route to next plumber
    if (admin && leadId && plumberId) {
      const { data: lead } = await (admin as any)
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single()
        .catch(() => ({ data: null }));

      if (lead) {
        // Mark declined and find next plumber
        const { data: plumbers } = await (admin as any)
          .from('auth_users')
          .select('id, full_name, email, phone')
          .in('role', ['tech', 'admin'])
          .neq('id', plumberId)
          .limit(1);

        const nextPlumber = plumbers?.[0];
        if (nextPlumber) {
          const { notifyPlumber } = await import('@/lib/lead-routing');
          await notifyPlumber({
            plumberId: nextPlumber.id,
            companyId: nextPlumber.id,
            companyName: nextPlumber.full_name || 'Plumber',
            ownerName: nextPlumber.full_name || 'Plumber',
            phone: nextPlumber.phone || '',
            email: nextPlumber.email || '',
            score: 0.7,
            distanceMiles: 0,
            distanceScore: 1,
            availabilityScore: 1,
            planTierScore: 0.5,
            ratingScore: 0.9,
            responseSpeedScore: 1,
          }, {
            id: lead.id,
            customerAddress: lead.customer_address || '',
            customerCity: lead.customer_city || '',
            estimatedJobValue: lead.total_estimate || 0,
            depositAmount: lead.deposit_paid || 0,
            depositTier: lead.deposit_tier || '',
            diagnosis: lead.diagnosis || '',
            severity: lead.severity || '',
            customerName: lead.customer_name || '',
            customerPhone: lead.customer_phone || '',
            customerEmail: lead.customer_email || '',
          }).catch(() => {});
        }
      }
    }

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Lead Declined</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fef2f2;padding:20px}
.card{background:white;border-radius:16px;padding:40px;text-align:center;max-width:400px;box-shadow:0 4px 24px rgba(0,0,0,.08)}
.icon{width:64px;height:64px;background:#EF4444;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:32px;color:white}
h1{font-size:22px;color:#111827;margin:0 0 8px}
p{color:#6B7280;font-size:14px;margin:0 0 4px;line-height:1.5}
</style></head><body>
<div class="card">
<div class="icon">👋</div>
<h1>Lead Declined</h1>
<p>The lead has been passed to another plumber.</p>
</div></body></html>`;

    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (err: any) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}
