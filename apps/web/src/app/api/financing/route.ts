import { NextRequest, NextResponse } from 'next/server';
import {
  getFinancingApplications,
  getFinancingApplication,
  createFinancingApplication,
  updateFinancingApplication,
  getFinancingRevenueSummary,
  simulateApplicationDecision,
  seedDemoFinancingApplications,
  resetFallbackData,
} from '@/lib/financingDb';

/* ── Auth helpers ── */
function getCompanyId(req: NextRequest): string | null {
  // In a real app, decode the JWT/session token from Authorization header
  // For demo, extract from x-company-id header or default
  const companyId = req.headers.get('x-company-id') || 'company-001';
  return companyId;
}

function isAuthenticated(req: NextRequest): boolean {
  const auth = req.headers.get('Authorization');
  // In production, validate JWT here
  // For demo, allow all requests
  return true;
}

/* ── GET /api/financing ── */
export async function GET(req: NextRequest) {
  try {
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const companyId = getCompanyId(req);
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const summary = url.searchParams.get('summary');
    const seed = url.searchParams.get('seed');

    // Seed demo data
    if (seed === 'true') {
      resetFallbackData();
      seedDemoFinancingApplications(companyId);
      return NextResponse.json({ success: true, message: 'Demo financing data seeded' });
    }

    // Get single application
    if (id) {
      const app = await getFinancingApplication(id);
      if (!app) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json(app);
    }

    // Get revenue summary
    if (summary === 'true') {
      const revenueSummary = await getFinancingRevenueSummary(companyId);
      return NextResponse.json(revenueSummary);
    }

    // Get all applications
    const apps = await getFinancingApplications(companyId);
    return NextResponse.json(apps);
  } catch (err) {
    console.error('[Financing API] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/* ── POST /api/financing ── */
export async function POST(req: NextRequest) {
  try {
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const action = body.action;

    // Simulate a financing application decision
    if (action === 'simulate') {
      const { amount, termsMonths, customerName } = body;
      if (!amount || amount < 500) {
        return NextResponse.json({
          approved: false,
          termsMonths: termsMonths || 12,
          reason: 'Minimum financing amount is $500',
        });
      }

      const decision = simulateApplicationDecision(amount, termsMonths || 12, customerName);
      return NextResponse.json(decision);
    }

    // Create a new financing application
    if (action === 'apply') {
      const companyId = getCompanyId(req);
      if (!companyId) {
        return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
      }

      const {
        invoice_id,
        job_id,
        customer_id,
        customer_name,
        customer_email,
        customer_phone,
        amount,
        provider,
        terms_months,
        apr,
        monthly_payment,
        approved_amount,
      } = body;

      if (!invoice_id || !customer_id || !customer_name || !customer_email || !amount) {
        return NextResponse.json({
          error: 'Missing required fields: invoice_id, customer_id, customer_name, customer_email, amount',
        }, { status: 400 });
      }

      const app = await createFinancingApplication({
        company_id: companyId,
        invoice_id,
        job_id: job_id || '',
        customer_id,
        customer_name,
        customer_email,
        customer_phone: customer_phone || '',
        amount: Number(amount),
        provider: provider || 'affirm',
        status: 'pending',
        approved_amount: approved_amount ? Number(approved_amount) : undefined,
        terms_months: terms_months || 12,
        monthly_payment: monthly_payment ? Number(monthly_payment) : undefined,
        apr: apr ? Number(apr) : undefined,
        notes: body.notes || '',
      });

      if (!app) {
        return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
      }

      return NextResponse.json(app, { status: 201 });
    }

    return NextResponse.json({ error: 'Unknown action. Use "simulate" or "apply".' }, { status: 400 });
  } catch (err) {
    console.error('[Financing API] POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/* ── PATCH /api/financing ── */
export async function PATCH(req: NextRequest) {
  try {
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Application ID required' }, { status: 400 });
    }

    const allowedUpdates: string[] = [
      'status', 'approved_amount', 'terms_months', 'monthly_payment',
      'apr', 'notes', 'customer_phone', 'application_data',
    ];

    const filteredUpdates: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = value;
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const updated = await updateFinancingApplication(id, filteredUpdates);
    if (!updated) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error('[Financing API] PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
