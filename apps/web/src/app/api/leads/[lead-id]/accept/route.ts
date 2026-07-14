import { NextResponse } from 'next/server';

/**
 * POST /api/leads/[lead-id]/accept
 *
 * Called by a plumber to accept a lead.
 *
 * Body: { plumberId: string; companyId: string }
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
