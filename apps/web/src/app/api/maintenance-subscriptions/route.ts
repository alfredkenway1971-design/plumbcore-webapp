import { NextRequest, NextResponse } from 'next/server';
import { decodeSessionToken } from '@/lib/custom-auth';
import {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  cancelSubscription,
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

/* GET /api/maintenance-subscriptions */
export async function GET(req: NextRequest) {
  try {
    const companyId = getCompanyId(req);
    if (!companyId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const subs = getSubscriptions(companyId);
    return NextResponse.json({ subscriptions: subs });
  } catch (e) {
    console.error('[MaintenanceSubscriptions API] GET error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/* POST /api/maintenance-subscriptions */
export async function POST(req: NextRequest) {
  try {
    const companyId = getCompanyId(req);
    if (!companyId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { action, ...data } = body;

    if (action === 'create') {
      const sub = createSubscription({
        ...data,
        company_id: companyId,
        status: 'active',
        auto_renew: data.auto_renew ?? true,
        start_date: data.start_date || new Date().toISOString(),
        next_billing_date: data.next_billing_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      return NextResponse.json({ subscription: sub }, { status: 201 });
    }

    if (action === 'cancel') {
      const cancelled = cancelSubscription(data.subscriptionId);
      if (!cancelled) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json({ success: true });
    }

    if (action === 'update') {
      const updated = updateSubscription(data.subscriptionId, data.updates);
      if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json({ subscription: updated });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    console.error('[MaintenanceSubscriptions API] POST error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
