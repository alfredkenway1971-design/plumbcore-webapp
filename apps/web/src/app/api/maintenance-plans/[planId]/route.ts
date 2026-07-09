import { NextRequest, NextResponse } from 'next/server';
import { decodeSessionToken } from '@/lib/custom-auth';
import { getPlanById, updatePlan, deletePlan } from '@/lib/plansDb';

function getCompanyId(req: NextRequest): string | null {
  const authHdr = req.headers.get('Authorization');
  const token = authHdr?.startsWith('Bearer ')
    ? authHdr.slice(7)
    : req.cookies.get('auth_token')?.value;
  if (!token) return null;
  const session = decodeSessionToken(token);
  return session?.company?.id || null;
}

/* GET /api/maintenance-plans/[planId] */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  const { planId } = await params;
  const plan = getPlanById(planId);
  if (!plan) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ plan });
}

/* PATCH /api/maintenance-plans/[planId] */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  const companyId = getCompanyId(req);
  if (!companyId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { planId } = await params;
  const updates = await req.json();
  const updated = updatePlan(planId, updates);
  if (!updated) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ plan: updated });
}

/* DELETE /api/maintenance-plans/[planId] */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  const companyId = getCompanyId(req);
  if (!companyId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { planId } = await params;
  const deleted = deletePlan(planId);
  if (!deleted) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
