import { NextResponse } from 'next/server';

/**
 * POST /api/leads/expire
 *
 * Called when the accept timer expires (via cron/webhook).
 * Routes the lead to the next plumber, or initiates expand/refund.
 *
 * Body: { leadId: string }
 */
export async function POST(req: Request) {
  try {
    const { leadId } = await req.json();

    if (!leadId) {
      return NextResponse.json({ error: 'Missing leadId' }, { status: 400 });
    }

    const { handlePlumberDecline, getRoutingSession, findBestPlumbers, notifyPlumber, processRefund } =
      await import('@/lib/lead-routing');

    const { getAdminClient } = await import('@/lib/supabase-admin');
    const admin = getAdminClient();

    // Check routing session
    const session = getRoutingSession(leadId);

    if (!session) {
      // No active session — check if lead exists in DB
      if (admin) {
        const { data: lead } = await (admin as any)
          .from('leads')
          .select('status')
          .eq('id', leadId)
          .single();

        if (!lead || lead.status === 'refunded' || lead.status === 'assigned') {
          return NextResponse.json({ status: 'already_resolved', leadStatus: lead?.status });
        }
      }

      return NextResponse.json({ error: 'No routing session found for lead' }, { status: 404 });
    }

    if (session.status === 'assigned' || session.status === 'refunded') {
      return NextResponse.json({ status: session.status, message: 'Already resolved' });
    }

    // Mark the currently notified plumber as "timed out" (treated as decline)
    const currentPlumber = session.scoredPlumbers[session.currentIndex];
    if (currentPlumber && !session.declinedPlumbers.includes(currentPlumber.plumberId)) {
      session.declinedPlumbers.push(currentPlumber.plumberId);
    }

    session.lastActionAt = Date.now();

    // Check if we've exhausted all plumbers at current radius
    const available = session.scoredPlumbers.filter(
      (p) => !session.declinedPlumbers.includes(p.plumberId),
    );

    if (available.length === 0) {
      if (session.radiusMiles < 50) {
        // Expand to 50 miles
        console.log(`[Expire] Expanding radius for lead ${leadId} to 50 miles`);
        session.radiusMiles = 50;

        if (admin) {
          const leadData = {
            ...session.lead,
          };
          const expandedPlumbers = await findBestPlumbers(leadData, admin, 50);

          if (expandedPlumbers.length > 0) {
            session.scoredPlumbers = expandedPlumbers;
            session.currentIndex = 0;
            session.status = 'expanded';

            await notifyPlumber(expandedPlumbers[0], session.lead);
            session.notifiedPlumbers.push(expandedPlumbers[0].plumberId);

            return NextResponse.json({
              status: 'expanded',
              radiusMiles: 50,
              nextPlumber: expandedPlumbers[0].companyName,
            });
          }
        }

        // Still no plumbers — refund
        console.log(`[Expire] No plumbers at expanded radius for ${leadId} — refunding`);
        const refundResult = await processRefund(leadId, admin);
        return NextResponse.json(refundResult);
      }

      // Already at max radius — refund
      console.log(`[Expire] All plumbers exhausted for ${leadId} — refunding`);
      const refundResult = await processRefund(leadId, admin);
      return NextResponse.json(refundResult);
    }

    // Route to next available plumber
    const nextPlumber = available[0];
    session.currentIndex = session.scoredPlumbers.indexOf(nextPlumber);

    await notifyPlumber(nextPlumber, session.lead);
    session.notifiedPlumbers.push(nextPlumber.plumberId);

    // Update lead in DB
    if (admin) {
      await (admin as any)
        .from('leads')
        .update({
          last_notified_plumber_id: nextPlumber.plumberId,
          notification_count: (session.notifiedPlumbers.length || 0),
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId);
    }

    console.log(`[Expire] Routed ${leadId} to next plumber: ${nextPlumber.companyName}`);

    return NextResponse.json({
      status: 'routing',
      nextPlumber: {
        plumberId: nextPlumber.plumberId,
        companyName: nextPlumber.companyName,
        score: nextPlumber.score,
      },
      notifiedCount: session.notifiedPlumbers.length,
      remainingCount: available.length - 1,
    });
  } catch (err: any) {
    console.error('[/api/leads/expire] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
