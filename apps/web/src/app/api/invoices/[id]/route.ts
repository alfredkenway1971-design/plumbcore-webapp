import { NextResponse } from 'next/server';

/**
 * GET /api/invoices/[id]
 * Returns full invoice data including line items, deposit credit, and balances.
 * Formatted for PDF/print rendering.
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;
    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    const { getAdminClient } = await import('@/lib/supabase-admin');
    const admin = getAdminClient();

    if (!admin) {
      // Return mock invoice data
      return NextResponse.json({
        id: invoiceId,
        status: 'sent',
        invoiceNumber: `INV-${invoiceId.substring(0, 8).toUpperCase()}`,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],

        // Company info (plumber)
        company: {
          name: 'Torres Plumbing',
          address: '123 Business Ave, Austin, TX 78701',
          phone: '(512) 555-0100',
          email: 'billing@torresplumbing.com',
          logoUrl: '',
        },

        // Customer info
        customer: {
          name: 'Sarah Johnson',
          address: '123 Main St, Austin, TX 78701',
          phone: '(512) 555-0101',
          email: 'sarah@email.com',
        },

        // Job info
        job: {
          id: 'JOB-001',
          title: 'Water Heater Repair',
          diagnosis: 'Leaking water heater — 40 gallon electric',
          completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },

        // Line items (from job)
        lineItems: [
          { id: 'li-001', description: 'Water heater repair — labor (4 hrs)', quantity: 1, unitPrice: 60000, total: 60000 },
          { id: 'li-002', description: '40 gal electric water heater', quantity: 1, unitPrice: 45000, total: 45000 },
          { id: 'li-003', description: 'Fittings, pipe, solder, flux', quantity: 1, unitPrice: 8500, total: 8500 },
          { id: 'li-004', description: 'Permit fee', quantity: 1, unitPrice: 7500, total: 7500 },
        ],

        // Totals
        subtotal: 121000,            // $1,210.00 (cents)
        depositCreditApplied: 4900,  // $49.00 deposit already paid (cents)
        customerBalanceDue: 116100,  // $1,161.00 (cents) — subtotal - deposit credit

        // Deposit info
        deposit: {
          amount: 4900,     // $49.00
          tier: 'small',
          paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          paymentMethod: 'credit_card',
          refunded: false,
        },

        // Payment status
        paymentStatus: 'partial',  // 'unpaid' | 'partial' | 'paid' | 'overdue'
        amountPaid: 4900,
        amountDue: 116100,

        // Metadata
        notes: 'Customer provided photos via AI estimate. All materials in stock.',
        terms: 'Net 30 — Payment due within 30 days of invoice date.',
        createdAt: new Date().toISOString(),
      });
    }

    // Try real DB
    const { data: invoice } = await (admin as any)
      .from('invoices')
      .select(`
        *,
        jobs!inner (
          id,
          title,
          description,
          completed_at,
          deposit_credit_applied,
          deposit_tier,
          estimated_cost,
          actual_cost,
          line_items,
          customer_id,
          assigned_plumber_id,
          plumber_profiles!jobs_assigned_plumber_id_fkey (
            company_name,
            slug,
            logo_url
          )
        )
      `)
      .eq('id', invoiceId)
      .single();

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Get customer data
    const { data: customer } = await (admin as any)
      .from('customers')
      .select('*')
      .eq('id', invoice.jobs?.customer_id)
      .single();

    // Get company data
    const { data: company } = await (admin as any)
      .from('companies')
      .select('*')
      .eq('id', invoice.company_id)
      .single();

    const lineItems = invoice.jobs?.line_items || [];
    const depositApplied = invoice.jobs?.deposit_credit_applied || 0;
    const subtotal = lineItems.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || invoice.total_amount || 0;
    const balanceDue = subtotal - depositApplied;

    return NextResponse.json({
      id: invoice.id,
      invoiceNumber: invoice.invoice_number || invoice.id,
      status: invoice.status,
      issueDate: invoice.issue_date?.split('T')[0],
      dueDate: invoice.due_date?.split('T')[0],

      company: {
        name: company?.name || invoice.jobs?.plumber_profiles?.company_name || '',
        address: company?.address || '',
        phone: company?.phone || '',
        email: company?.email || '',
        logoUrl: invoice.jobs?.plumber_profiles?.logo_url || '',
      },

      customer: {
        name: customer?.name || invoice.customer_name || '',
        address: customer?.address || '',
        phone: customer?.phone || '',
        email: customer?.email || '',
      },

      job: {
        id: invoice.jobs?.id,
        title: invoice.jobs?.title,
        diagnosis: invoice.jobs?.description,
        completedAt: invoice.jobs?.completed_at?.split('T')[0],
      },

      lineItems,

      subtotal,
      depositCreditApplied: depositApplied,
      customerBalanceDue: Math.max(0, balanceDue),

      deposit: {
        amount: depositApplied,
        tier: invoice.jobs?.deposit_tier || '',
        paidAt: invoice.deposit_paid_at || null,
        paymentMethod: invoice.deposit_payment_method || null,
        refunded: invoice.deposit_refunded || false,
      },

      paymentStatus: balanceDue <= 0 ? 'paid' : invoice.status === 'paid' ? 'paid' : 'partial',
      amountPaid: depositApplied + (invoice.amount_paid || 0),
      amountDue: Math.max(0, balanceDue),

      notes: invoice.notes || '',
      terms: invoice.terms || 'Net 30',
      createdAt: invoice.created_at,
    });
  } catch (err: any) {
    console.error('Invoice GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
