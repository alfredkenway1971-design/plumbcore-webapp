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
