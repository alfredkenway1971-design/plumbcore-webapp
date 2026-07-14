/**
 * Lead Routing Module
 *
 * Scores, ranks, and routes leads (customer deposits) to the best available
 * plumber based on distance, availability, plan tier, rating, and response speed.
 *
 * Uses in-memory routing state (no Redis). Timer-based routing (accept/expire/refund)
 * is handled via API endpoints called by cron jobs or webhooks.
 */

import { sendEmail, refundNotificationEmail } from '@/lib/email';

// ── Types ──

export interface LeadData {
  id: string;
  customerAddress: string;
  customerCity: string;
  estimatedJobValue: number;
  depositAmount: number;
  depositTier: string;
  diagnosis: string;
  severity: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  stripeSessionId?: string;
}

export interface PlumberScore {
  plumberId: string;
  companyId: string;
  companyName: string;
  ownerName: string;
  phone: string;
  email: string;
  score: number;
  distanceMiles: number;
  distanceScore: number;
  availabilityScore: number;
  planTierScore: number;
  ratingScore: number;
  responseSpeedScore: number;
}

// ── Config ──

const ROUTING_CONFIG = {
  INITIAL_RADIUS_MILES: 25,
  EXPANDED_RADIUS_MILES: 50,
  ACCEPT_TIMEOUT_SECONDS: 300,       // 5 min
  EXPAND_TIMEOUT_SECONDS: 900,       // 15 min
  REFUND_TIMEOUT_SECONDS: 1800,      // 30 min
  MAX_PLUMBERS_TO_NOTIFY: 10,
  DISTANCE_WEIGHT: 0.40,
  AVAILABILITY_WEIGHT: 0.30,
  PLAN_TIER_WEIGHT: 0.15,
  RATING_WEIGHT: 0.10,
  RESPONSE_SPEED_WEIGHT: 0.05,
};

// ── In-Memory Routing State ──
// Maps leadId -> routing state (no Redis, resets on cold start)

export interface RoutingSession {
  leadId: string;
  lead: LeadData;
  status: 'routing' | 'expanded' | 'assigned' | 'refunded';
  currentIndex: number;          // index into scoredPlumbers
  scoredPlumbers: PlumberScore[];
  notifiedPlumbers: string[];    // plumberIds that have been notified
  declinedPlumbers: string[];    // plumberIds that declined
  assignedPlumberId?: string;
  radiusMiles: number;
  startedAt: number;             // Date.now()
  lastActionAt: number;
}

const routingSessions = new Map<string, RoutingSession>();

export function getRoutingSession(leadId: string): RoutingSession | undefined {
  return routingSessions.get(leadId);
}

export function setRoutingSession(leadId: string, session: RoutingSession): void {
  routingSessions.set(leadId, session);
}

export function deleteRoutingSession(leadId: string): void {
  routingSessions.delete(leadId);
}

// ── Tier Mapping ──

export function getTierFromPlan(planTier: string): number {
  const tiers: Record<string, number> = {
    solo: 1,
    pro: 2,
    business: 3,
    enterprise: 4,
  };
  return tiers[planTier] || 0;
}

// ── Scoring Functions ──

/**
 * Calculate Haversine distance in miles between two lat/lng points
 */
function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Score a single plumber against a lead's location.
 *
 * @param plumber - plumber profile object from DB (must have lat, lng, plan_tier,
 *                  avg_rating, response_time_avg, current_month_leads, monthly_lead_limit, status)
 * @param customerLat - customer latitude
 * @param customerLng - customer longitude
 * @returns PlumberScore
 */
export function scorePlumber(plumber: any, customerLat: number, customerLng: number): PlumberScore {
  const distanceMiles = haversineMiles(
    customerLat,
    customerLng,
    plumber.lat || plumber.latitude || 0,
    plumber.lng || plumber.longitude || 0,
  );

  // Distance score: 1.0 at 0 miles, decays to 0.0 at 50 miles
  const distanceScore = Math.max(0, 1 - distanceMiles / 50);

  // Availability score: ratio of remaining leads to limit
  const leadLimit = plumber.monthly_lead_limit || 40;
  const usedLeads = plumber.current_month_leads || 0;
  const remainingRatio = Math.max(0, (leadLimit - usedLeads) / leadLimit);
  const availabilityScore = remainingRatio;

  // Plan tier score: normalize to 0-1 range
  const tierNum = getTierFromPlan(plumber.plan_tier);
  const planTierScore = tierNum / 4;

  // Rating score: normalize 0-5 to 0-1
  const ratingScore = (plumber.avg_rating || 0) / 5;

  // Response speed score: faster is better, 0 min = 1.0, 30 min = 0.0
  const responseTime = plumber.response_time_avg || 15;
  const responseSpeedScore = Math.max(0, 1 - responseTime / 30);

  // Composite weighted score
  const score =
    ROUTING_CONFIG.DISTANCE_WEIGHT * distanceScore +
    ROUTING_CONFIG.AVAILABILITY_WEIGHT * availabilityScore +
    ROUTING_CONFIG.PLAN_TIER_WEIGHT * planTierScore +
    ROUTING_CONFIG.RATING_WEIGHT * ratingScore +
    ROUTING_CONFIG.RESPONSE_SPEED_WEIGHT * responseSpeedScore;

  return {
    plumberId: plumber.id || plumber.plumber_id,
    companyId: plumber.company_id || '',
    companyName: plumber.company_name || 'Unknown Plumber',
    ownerName: plumber.owner_name || plumber.name || 'Unknown',
    phone: plumber.phone || '',
    email: plumber.email || '',
    score,
    distanceMiles: Math.round(distanceMiles * 10) / 10,
    distanceScore,
    availabilityScore,
    planTierScore,
    ratingScore,
    responseSpeedScore,
  };
}

// ── Find Best Plumbers ──

/**
 * Find the best plumbers for a lead within the given radius.
 * Queries Supabase for active plumbers, scores them, and returns top N.
 */
export async function findBestPlumbers(
  lead: LeadData,
  supabaseAdmin: any,
  radiusMiles: number = ROUTING_CONFIG.INITIAL_RADIUS_MILES,
): Promise<PlumberScore[]> {
  try {
    // Query active plumber profiles
    const { data: plumbers, error } = await (supabaseAdmin as any)
      .from('plumber_profiles')
      .select('*')
      .eq('status', 'active')
      .lte('current_month_leads', supabaseAdmin.rpc ? undefined : 999); // Fallback: just get all active

    if (error) {
      console.error('[LeadRouting] Failed to fetch plumbers:', error.message);
      return [];
    }

    if (!plumbers || plumbers.length === 0) {
      console.log('[LeadRouting] No active plumbers found');
      return [];
    }

    // Use Austin, TX as default coordinates if we can't geocode the lead address
    // In production, geocode the lead's address to get actual lat/lng
    const customerLat = 30.2672; // Austin default
    const customerLng = -97.7431;

    // Score each plumber
    const scored: PlumberScore[] = plumbers
      .map((p: any) => scorePlumber(p, customerLat, customerLng))
      .filter((p: PlumberScore) => p.distanceMiles <= radiusMiles);

    // Sort by score descending and return top N
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, ROUTING_CONFIG.MAX_PLUMBERS_TO_NOTIFY);
  } catch (err: any) {
    console.error('[LeadRouting] findBestPlumbers error:', err.message);
    return [];
  }
}

// ── Notify Plumber ──

/**
 * Notify a plumber about a new lead via email (and optionally SMS/dashboard).
 */
export async function notifyPlumber(plumber: PlumberScore, lead: LeadData): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://plumbcore-ai.vercel.app';
  const acceptUrl = `${appUrl}/api/leads/${lead.id}/accept`;
  const declineUrl = `${appUrl}/api/leads/${lead.id}/decline`;

  try {
    // Send email notification
    await sendEmail({
      to: plumber.email,
      subject: `🔔 New lead: ${lead.diagnosis} — ${lead.customerCity}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3B82F6, #06B6D4); padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">New Lead Available 🔔</h1>
          </div>
          <div style="padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #334155; font-size: 16px;"><strong>${lead.customerName}</strong> — ${lead.customerCity}</p>
            <div style="background: #f8fafc; border-radius: 8px; padding: 12px; margin: 12px 0;">
              <p style="margin: 0 0 4px; color: #475569;"><strong>Issue:</strong> ${lead.diagnosis}</p>
              <p style="margin: 0 0 4px; color: #475569;"><strong>Severity:</strong> ${lead.severity}</p>
              <p style="margin: 0 0 4px; color: #475569;"><strong>Est. Job Value:</strong> $${lead.estimatedJobValue.toFixed(2)}</p>
              <p style="margin: 0; color: #475569;"><strong>Distance:</strong> ${plumber.distanceMiles} miles</p>
            </div>
            <p style="color: #64748b; font-size: 13px;">You have <strong>5 minutes</strong> to accept this lead.</p>
            <div style="display: flex; gap: 8px; margin-top: 16px;">
              <a href="${acceptUrl}" style="flex: 1; text-align: center; padding: 12px; background: #10B981; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">Accept Lead</a>
              <a href="${declineUrl}" style="flex: 1; text-align: center; padding: 12px; background: #EF4444; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">Decline</a>
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 12px;">Customer phone: ${lead.customerPhone}</p>
          </div>
        </div>
      `,
    });

    console.log(`[LeadRouting] Notified ${plumber.companyName} (${plumber.email}) about lead ${lead.id}`);

    // TODO: Send SMS via Twilio when configured
    // TODO: Push dashboard notification
  } catch (err: any) {
    console.error(`[LeadRouting] Failed to notify plumber ${plumber.plumberId}:`, err.message);
  }
}

// ── Route Lead ──

/**
 * Route a lead to the best available plumber.
 *
 * Steps:
 * 1. Find plumbers within initial radius
 * 2. Score and rank them
 * 3. Notify #1 via email/SMS/dashboard
 * 4. Start accept timer (the caller should schedule POST /api/leads/expire after ACCEPT_TIMEOUT_SECONDS)
 * 5. Returns the routing session with status
 */
export async function routeLead(
  lead: LeadData,
  supabaseAdmin: any,
): Promise<{ status: string; session: RoutingSession }> {
  console.log(`[LeadRouting] Routing lead ${lead.id} (${lead.diagnosis})`);

  // Find and score plumbers
  const scoredPlumbers = await findBestPlumbers(lead, supabaseAdmin, ROUTING_CONFIG.INITIAL_RADIUS_MILES);

  if (scoredPlumbers.length === 0) {
    console.log(`[LeadRouting] No plumbers found within ${ROUTING_CONFIG.INITIAL_RADIUS_MILES} miles for lead ${lead.id}`);

    // Try expanded radius
    const expandedPlumbers = await findBestPlumbers(lead, supabaseAdmin, ROUTING_CONFIG.EXPANDED_RADIUS_MILES);

    if (expandedPlumbers.length === 0) {
      console.log(`[LeadRouting] No plumbers found at all for lead ${lead.id} — auto-refunding`);
      return {
        status: 'refunded',
        session: {
          leadId: lead.id,
          lead,
          status: 'refunded' as const,
          currentIndex: -1,
          scoredPlumbers: [],
          notifiedPlumbers: [],
          declinedPlumbers: [],
          radiusMiles: ROUTING_CONFIG.EXPANDED_RADIUS_MILES,
          startedAt: Date.now(),
          lastActionAt: Date.now(),
        },
      };
    }

    // Create session with expanded radius plumbers
    const session: RoutingSession = {
      leadId: lead.id,
      lead,
      status: 'expanded',
      currentIndex: 0,
      scoredPlumbers: expandedPlumbers,
      notifiedPlumbers: [],
      declinedPlumbers: [],
      radiusMiles: ROUTING_CONFIG.EXPANDED_RADIUS_MILES,
      startedAt: Date.now(),
      lastActionAt: Date.now(),
    };

    routingSessions.set(lead.id, session);

    // Notify first plumber
    await notifyPlumber(expandedPlumbers[0], lead);
    session.notifiedPlumbers.push(expandedPlumbers[0].plumberId);

    console.log(`[LeadRouting] Notified #1 plumber (expanded): ${expandedPlumbers[0].companyName}`);

    return { status: 'routing', session };
  }

  // Create session with initial radius plumbers
  const session: RoutingSession = {
    leadId: lead.id,
    lead,
    status: 'routing',
    currentIndex: 0,
    scoredPlumbers,
    notifiedPlumbers: [],
    declinedPlumbers: [],
    radiusMiles: ROUTING_CONFIG.INITIAL_RADIUS_MILES,
    startedAt: Date.now(),
    lastActionAt: Date.now(),
  };

  routingSessions.set(lead.id, session);

  // Notify first plumber
  await notifyPlumber(scoredPlumbers[0], lead);
  session.notifiedPlumbers.push(scoredPlumbers[0].plumberId);

  console.log(`[LeadRouting] Notified #1 plumber: ${scoredPlumbers[0].companyName} (score: ${scoredPlumbers[0].score.toFixed(3)})`);

  return { status: 'routing', session };
}

/**
 * Handle a plumber declining a lead.
 * Routes to the next plumber in the scored list.
 */
export async function handlePlumberDecline(
  leadId: string,
  plumberId: string,
  _reason?: string,
): Promise<{ status: string; nextPlumber?: PlumberScore }> {
  const session = routingSessions.get(leadId);
  if (!session) {
    console.error(`[LeadRouting] No routing session for lead ${leadId}`);
    return { status: 'not_found' };
  }

  // Add plumber to declined list
  if (!session.declinedPlumbers.includes(plumberId)) {
    session.declinedPlumbers.push(plumberId);
  }

  session.lastActionAt = Date.now();

  // Check if we've exhausted all plumbers
  const availablePlumbers = session.scoredPlumbers.filter(
    (p) => !session.declinedPlumbers.includes(p.plumberId) && !session.notifiedPlumbers.includes(p.plumberId),
  );

  if (availablePlumbers.length === 0) {
    // All plumbers have declined — try expanding radius if not already expanded
    if (session.radiusMiles < ROUTING_CONFIG.EXPANDED_RADIUS_MILES) {
      console.log(`[LeadRouting] All plumbers declined for ${leadId} — expanding radius`);
      // The caller should trigger an expand via the /api/leads/expire endpoint
      return { status: 'expand_needed' };
    }

    // Already expanded — auto-refund
    console.log(`[LeadRouting] All plumbers exhausted for ${leadId} — auto-refund`);
    session.status = 'refunded';
    return { status: 'refunded' };
  }

  // Route to next plumber
  const nextPlumber = availablePlumbers[0];
  session.currentIndex = session.scoredPlumbers.indexOf(nextPlumber);
  await notifyPlumber(nextPlumber, session.lead);
  session.notifiedPlumbers.push(nextPlumber.plumberId);

  console.log(`[LeadRouting] Routed ${leadId} to next plumber: ${nextPlumber.companyName}`);

  return { status: 'routing', nextPlumber };
}

/**
 * Handle a plumber accepting a lead.
 */
export async function handlePlumberAccept(
  leadId: string,
  plumberId: string,
  companyId: string,
  supabaseAdmin: any,
): Promise<{ status: string; error?: string }> {
  const session = routingSessions.get(leadId);
  if (!session) {
    console.error(`[LeadRouting] No routing session for lead ${leadId}`);
    return { status: 'not_found' };
  }

  // Verify the plumber is in the scored list
  const plumber = session.scoredPlumbers.find((p) => p.plumberId === plumberId);
  if (!plumber) {
    return { status: 'invalid_plumber', error: 'Plumber not found in routing list' };
  }

  // Update session
  session.status = 'assigned';
  session.assignedPlumberId = plumberId;
  session.lastActionAt = Date.now();

  // Update lead in database
  try {
    await (supabaseAdmin as any)
      .from('leads')
      .update({
        status: 'assigned',
        assigned_plumber_id: plumberId,
        assigned_company_id: companyId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId);

    // Create job record
    await (supabaseAdmin as any).from('jobs').insert({
      lead_id: leadId,
      company_id: companyId,
      assigned_plumber_id: plumberId,
      customer_name: session.lead.customerName,
      customer_email: session.lead.customerEmail,
      customer_phone: session.lead.customerPhone,
      customer_address: session.lead.customerAddress,
      diagnosis: session.lead.diagnosis,
      severity: session.lead.severity,
      total_estimate: session.lead.estimatedJobValue,
      deposit_paid: session.lead.depositAmount,
      deposit_tier: session.lead.depositTier,
      estimated_job_value: session.lead.estimatedJobValue,
      status: 'assigned',
      created_at: new Date().toISOString(),
    });

    console.log(`[LeadRouting] Lead ${leadId} assigned to plumber ${plumberId}`);
  } catch (err: any) {
    console.error(`[LeadRouting] Failed to update lead ${leadId}:`, err.message);
    return { status: 'db_error', error: err.message };
  }

  return { status: 'assigned' };
}

/**
 * Process a full refund for a lead when no plumber was found.
 */
export async function processRefund(
  leadId: string,
  supabaseAdmin: any,
): Promise<{ status: string; refundId?: string; error?: string }> {
  const session = routingSessions.get(leadId);
  const lead = session?.lead;

  try {
    // Fetch lead data from DB if we don't have session
    let stripeSessionId = lead?.stripeSessionId || '';
    let customerEmail = lead?.customerEmail || '';
    let customerName = lead?.customerName || 'Customer';
    let diagnosis = lead?.diagnosis || '';
    let totalEstimate = lead?.estimatedJobValue || 0;
    let depositAmount = lead?.depositAmount || 0;

    if (!stripeSessionId && supabaseAdmin) {
      try {
        const { data: dbLead } = await (supabaseAdmin as any)
          .from('leads')
          .select('*')
          .eq('id', leadId)
          .single();

        if (dbLead) {
          stripeSessionId = dbLead.stripe_session_id || '';
          customerEmail = dbLead.customer_email || customerEmail;
          customerName = dbLead.customer_name || customerName;
          diagnosis = dbLead.diagnosis || diagnosis;
          totalEstimate = dbLead.total_estimate || totalEstimate;
          depositAmount = dbLead.deposit_paid || depositAmount;
        }
      } catch (err: any) {
        console.error(`[LeadRouting] Failed to fetch lead ${leadId} from DB:`, err.message);
      }
    }

    // Process Stripe refund
    if (stripeSessionId) {
      try {
        // Get the PaymentIntent from the checkout session
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
          apiVersion: '2026-06-24.dahlia' as any,
        });

        const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
        const paymentIntentId = session.payment_intent as string;

        if (paymentIntentId) {
          const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            reason: 'requested_by_customer',
          });

          console.log(`[LeadRouting] Refund processed: ${refund.id} for lead ${leadId}`);

          // Update lead status
          if (supabaseAdmin) {
            await (supabaseAdmin as any)
              .from('leads')
              .update({
                status: 'refunded',
                refund_id: refund.id,
                refunded_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', leadId);
          }

          // Send refund notification email
          if (customerEmail) {
            const emailContent = refundNotificationEmail({
              customerName,
              diagnosis,
              totalEstimate,
              amountPaid: depositAmount,
              leadId,
              customerEmail,
            });
            await sendEmail({
              to: customerEmail,
              subject: emailContent.subject,
              html: emailContent.html,
            });
          }

          if (session) {
            const existingSession = routingSessions.get(leadId);
            if (existingSession) {
              routingSessions.set(leadId, {
                ...existingSession,
                status: 'refunded',
                lastActionAt: Date.now(),
              });
            }
          }

          return { status: 'refunded', refundId: refund.id };
        }
      } catch (err: any) {
        console.error(`[LeadRouting] Stripe refund failed for lead ${leadId}:`, err.message);
        return { status: 'refund_failed', error: err.message };
      }
    }

    // No Stripe session — just mark as refunded
    if (supabaseAdmin) {
      await (supabaseAdmin as any)
        .from('leads')
        .update({
          status: 'refunded',
          refunded_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId);
    }

    if (session) {
      routingSessions.set(leadId, {
        ...session,
        status: 'refunded',
        lastActionAt: Date.now(),
      });
    }

    return { status: 'refunded' };
  } catch (err: any) {
    console.error(`[LeadRouting] processRefund error:`, err.message);
    return { status: 'error', error: err.message };
  }
}

export { ROUTING_CONFIG };
