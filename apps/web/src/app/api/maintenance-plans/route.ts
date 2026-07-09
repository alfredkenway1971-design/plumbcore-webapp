import { NextRequest, NextResponse } from 'next/server';
import { decodeSessionToken } from '@/lib/custom-auth';
import {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  getSubscriptions,
  getSubscriptionsByPlan,
  getMaintenanceMRR,
  getActiveSubscriptionCount,
  getUpcomingVisits,
} from '@/lib/plansDb';

function getCompanyId(req: NextRequest): string | null {
  const authHdr = req.headers.get('Authorization');
  const token = authHdr?.startsWith('Bearer ')
    ? authHdr.slice(7)
    : req.cookies.get('auth_token')?.value;
  if (!token) return null;
  const session = decodeSessionToken(token);
  return session?.company?.id || null;
}

/* ── GET /api/maintenance-plans?mode=plans|subscriptions|visits|mrr ── */
export async function GET(req: NextRequest) {
  try {
    const companyId = getCompanyId(req);
    if (!companyId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const mode = req.nextUrl.searchParams.get('mode') || 'plans';
    const planId = req.nextUrl.searchParams.get('planId');

    switch (mode) {
      case 'plans': {
        const plans = getPlans(companyId);
        return NextResponse.json({ plans });
      }
      case 'plan': {
        if (!planId) return NextResponse.json({ error: 'planId required' }, { status: 400 });
        const plan = getPlanById(planId);
        if (!plan) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ plan });
      }
      case 'subscriptions': {
        const subs = planId
          ? getSubscriptionsByPlan(planId)
          : getSubscriptions(companyId);
        return NextResponse.json({ subscriptions: subs });
      }
      case 'visits': {
        const visits = getUpcomingVisits(companyId);
        return NextResponse.json({ visits });
      }
      case 'mrr': {
        const mrr = getMaintenanceMRR(companyId);
        const count = getActiveSubscriptionCount(companyId);
        return NextResponse.json({ mrr, activeSubscriptions: count });
      }
      default:
        return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    }
  } catch (e) {
    console.error('[MaintenancePlans API] GET error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/* ── POST /api/maintenance-plans ── */
export async function POST(req: NextRequest) {
  try {
    const companyId = getCompanyId(req);
    if (!companyId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { action, ...data } = body;

    if (action === 'create_plan') {
      const plan = createPlan({
        ...data,
        company_id: companyId,
        is_active: true,
        interval_months: data.interval_months || 6,
      });
      return NextResponse.json({ plan }, { status: 201 });
    }

    if (action === 'update_plan') {
      const updated = updatePlan(data.planId, data.updates);
      if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json({ plan: updated });
    }

    if (action === 'delete_plan') {
      const deleted = deletePlan(data.planId);
      if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    console.error('[MaintenancePlans API] POST error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
