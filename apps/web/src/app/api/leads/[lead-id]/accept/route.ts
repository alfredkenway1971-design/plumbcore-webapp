import { NextResponse } from 'next/server';

/**
 * POST /api/leads/[lead-id]/accept — Accept a lead (plumber clicks email link)
 * GET  /api/leads/[lead-id]/accept — Auto-accept via email link
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ 'lead-id': string }> },
) {
  try {
    const { 'lead-id': leadId } = await params;
    const { plumberId, companyId } = await req.json();

    if (!leadId || !plumberId) {
      return NextResponse.json(
        { error: 'Missing required fields: leadId, plumberId' },
        { status: 400 },
      );
    }

    const { handlePlumberAccept } = await import('@/lib/lead-routing');
    const { getAdminClient } = await import('@/lib/supabase-admin');
    const admin = getAdminClient();

    const result = await handlePlumberAccept(leadId, plumberId, companyId || plumberId, admin);

    if (result.status === 'assigned') {
      return NextResponse.json({
        status: 'assigned',
        message: 'Lead accepted successfully',
        leadId,
      });
    }

    if (result.status === 'not_found') {
      // No routing session — try direct assignment via DB
      if (admin) {
        try {
          await (admin as any)
            .from('leads')
            .update({
              status: 'assigned',
              assigned_plumber_id: plumberId,
              assigned_company_id: companyId || plumberId,
              updated_at: new Date().toISOString(),
            })
            .eq('id', leadId)
            .eq('status', 'routing');

          // Create job record
          await (admin as any).from('jobs').insert({
            lead_id: leadId,
            company_id: companyId || plumberId,
            assigned_plumber_id: plumberId,
            status: 'assigned',
            created_at: new Date().toISOString(),
          });

          return NextResponse.json({
            status: 'assigned',
            message: 'Lead accepted directly via DB',
            leadId,
          });
        } catch (dbErr: any) {
          console.error('[Accept] DB direct assignment failed:', dbErr.message);
        }
      }

      return NextResponse.json(
        { error: 'No routing session found for this lead. It may have already been assigned or expired.' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: result.error || 'Failed to accept lead' },
      { status: 400 },
    );
  } catch (err: any) {
    console.error('[/api/leads/[lead-id]/accept] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * GET handler — plumber clicks Accept in email
 * Auto-accepts and shows confirmation page
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ 'lead-id': string }> },
) {
  try {
    const { 'lead-id': leadId } = await params;
    const url = new URL(req.url);
    const plumberId = url.searchParams.get('plumberId') || '';

    if (!leadId) {
      return new Response('Missing lead ID', { status: 400 });
    }

    const { getAdminClient } = await import('@/lib/supabase-admin');
    const admin = getAdminClient();

    // Get lead info
    let customerName = 'Customer';
    if (admin) {
      try {
        const { data } = await (admin as any)
          .from('leads')
          .select('customer_name, customer_address, total_estimate, assigned_plumber_name')
          .eq('id', leadId)
          .maybeSingle();

        if (data) {
          customerName = data.customer_name || customerName;
          await (admin as any)
            .from('leads')
            .update({
              status: 'assigned',
              assigned_plumber_id: plumberId || data.assigned_plumber_id,
              assigned_plumber_name: data.assigned_plumber_name || 'Plumber',
              updated_at: new Date().toISOString(),
            })
            .eq('id', leadId)
            .in('status', ['matching', 'routing', 'assigned']);

          await (admin as any).from('jobs').insert({
            lead_id: leadId,
            company_id: plumberId || data.assigned_plumber_id,
            customer_name: data.customer_name || '',
            customer_address: data.customer_address || '',
            total_estimate: data.total_estimate || 0,
            diagnosis: 'Accepted via email link',
            status: 'assigned',
            created_at: new Date().toISOString(),
          }).catch(() => {});
        }
      } catch (e) {
        console.error('Accept processing error:', e);
      }
    }

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Lead Accepted</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f0fdf4;padding:20px}
.card{background:white;border-radius:16px;padding:40px;text-align:center;max-width:400px;box-shadow:0 4px 24px rgba(0,0,0,.08)}
.icon{width:64px;height:64px;background:#10B981;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:32px;color:white}
h1{font-size:22px;color:#111827;margin:0 0 8px}
p{color:#6B7280;font-size:14px;margin:0 0 4px;line-height:1.5}
.btn{display:inline-block;margin-top:20px;padding:12px 24px;background:#111827;color:white;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600}
</style></head><body>
<div class="card">
<div class="icon">✅</div>
<h1>Lead Accepted!</h1>
<p>You've been assigned to <strong>${customerName}</strong>.</p>
<p style="font-size:13px;color:#9CA3AF;margin-top:12px">The job has been created in your dashboard. Log in to view details and start working.</p>
<a href="/dashboard" class="btn">Go to Dashboard</a>
</div></body></html>`;

    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (err: any) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}
