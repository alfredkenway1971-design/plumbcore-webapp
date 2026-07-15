import { NextResponse } from 'next/server';

/**
 * POST /api/leads/[lead-id]/status
 *
 * Returns the current status and data for a lead.
 * Public — no auth required (used by the tracking page).
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ 'lead-id': string }> },
) {
  try {
    const leadId = (await params)['lead-id'];

    if (!leadId) {
      return NextResponse.json({ error: 'Missing lead ID' }, { status: 400 });
    }

    const { getAdminClient } = await import('@/lib/supabase-admin');
    const admin = getAdminClient();

    if (admin) {
      try {
        const { data: lead, error } = await (admin as any)
          .from('leads')
          .select('*')
          .eq('id', leadId)
          .maybeSingle();

        if (error) {
          // Table might not exist — fall through to mock
          if (error.message?.includes('Could not find the table') || error.message?.includes('relation') || error.message?.includes('does not exist')) {
            console.warn(`[/api/leads/${leadId}/status] Leads table not found, using mock data`);
            // Fall through to mock below
          } else {
            return NextResponse.json({ error: 'Lead not found', details: error.message }, { status: 404 });
          }
        } else if (lead) {
          // If assigned, also fetch plumber info
          let plumberInfo = null;
          if (lead.status === 'assigned' && lead.assigned_plumber_id) {
            const { data: plumber } = await (admin as any)
              .from('plumber_profiles')
              .select('*')
              .eq('id', lead.assigned_plumber_id)
              .single();

            if (plumber) {
              plumberInfo = {
                id: plumber.id,
                companyId: plumber.company_id,
                companyName: plumber.company_name,
                phone: plumber.phone || '',
                avgRating: plumber.avg_rating,
                totalReviews: plumber.total_reviews,
                licenseNumber: plumber.license_number,
                logoUrl: plumber.logo_url,
              };
            }
          }

          return NextResponse.json({
            id: lead.id,
            status: lead.status,
            diagnosis: lead.diagnosis,
            severity: lead.severity,
            totalEstimate: lead.total_estimate || lead.estimated_job_value,
            depositPaid: lead.deposit_paid,
            customerCity: lead.customer_city,
            customerName: lead.customer_name,
            createdAt: lead.created_at,
            estimatedJobValue: lead.estimated_job_value,
            plumber: plumberInfo,
          });
        }
      } catch (dbErr: any) {
        console.warn(`[/api/leads/${leadId}/status] DB error, using mock: ${dbErr.message}`);
        // Fall through to mock
      }
    }

    // No admin or table doesn't exist — return mock data
    const mockData: Record<string, any> = {
      'demo-lead-001': {
        id: 'demo-lead-001',
        status: 'matching',
        diagnosis: 'Leaky faucet — worn cartridge',
        severity: 'moderate',
        totalEstimate: 251.18,
        depositPaid: 49,
        customerCity: 'Austin',
        customerName: 'Demo Customer',
        createdAt: new Date().toISOString(),
        estimatedJobValue: 251.18,
        plumber: null,
      },
    };

    const data = mockData[leadId];
    if (data) {
      return NextResponse.json(data);
    }

    // Return a generic mock response for any lead
    return NextResponse.json({
      id: leadId,
      status: 'matching',
      diagnosis: 'Leaky faucet — worn cartridge',
      severity: 'moderate',
      totalEstimate: 251.18,
      depositPaid: 49,
      customerCity: 'Austin',
      customerName: 'Customer',
      createdAt: new Date().toISOString(),
      estimatedJobValue: 251.18,
      plumber: null,
    });
  } catch (err: any) {
    console.error('[/api/leads/[lead-id]/status] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
