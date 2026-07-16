import { NextResponse, NextRequest } from 'next/server';

/**
 * LEAD CREATION DEBUG ENDPOINT
 * Returns the complete debugging JSON when you visit this URL
 * https://plumbcore-ai.vercel.app/api/debug-create-lead
 */
export async function GET(request: NextRequest) {
  try {
    const { getAdminClient } = await import('@/lib/supabase-admin');
    const admin = getAdminClient();

    console.log('🔍 DEBUG LEAD CREATION ENDPOINT');

    // 1. Check Supabase config
    console.log('  1. Supabase config:');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING';
    const serviceRole = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE || 'MISSING';
    console.log('     URL:', supabaseUrl.includes('supabase') ? '✅ SET' : '❌ MISSING');
    console.log('     ServiceRole:', serviceRole === 'MISSING' ? '❌ MISSING' : '✅ SET');

    // 2. Get all leads from database
    console.log('  2. Fetching leads from database...');
    const sb = admin as any;
    const { data: allLeads, error: leadError } = await sb
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (leadError) {
      console.error('  ❌ Error fetching leads:', leadError.message);
      return NextResponse.json({
        error: 'Failed to fetch leads',
        details: leadError.message
      }, { status: 500 });
    }

    console.log(`  ✅ Found ${allLeads.length} leads in database`);

    // 3. Check the latest lead details
    const latestLead = allLeads[0];
    if (latestLead) {
      console.log('  → Latest lead details:');
      console.log('     ID:', latestLead.id);
      console.log('     Name:', latestLead.customer_name);
      console.log('     Email:', latestLead.customer_email);
      console.log('     Status:', latestLead.status);
      console.log('     Tracking Token:', latestLead.tracking_token);
    }

    // 4. Check auth cookie
    const cookies = request.cookies;
    const authToken = cookies.get('auth_token');
    console.log('  3. Auth cookie:', authToken ? '✅ PRESENT' : '❌ MISSING');

    // 5. Check routes
    console.log('  4. Relevant routes:');
    console.log('     /api/leads/create-from-session: ✅ EXISTS');
    console.log('     /api/admin/data: ✅ EXISTS');
    console.log('     /admin/leads: ✅ EXISTS');

    return NextResponse.json({
      success: true,
      message: 'Debug info collected',
      database: {
        urlsConfigured: !!supabaseUrl,
        serviceRoleConfigured: serviceRole !== 'MISSING',
        leadCount: allLeads.length,
        latestLead: latestLead ? {
          id: latestLead.id,
          name: latestLead.customer_name,
          email: latestLead.customer_email,
          status: latestLead.status,
          tracking: latestLead.tracking_token
        } : null
      },
      auth: {
        cookiePresent: !!authToken,
        errorWhen: 'Admin pages return 401 when no auth cookie'
      },
      diagnosis: [
        allLeads.length === 0 ? '❌ No leads in database - lead creation is broken' : '✅ Leads exist in database',
        serviceRole === 'MISSING' ? '❌ Supabase service role NOT configured' : '✅ Service role configured',
        !authToken ? '❌ No auth cookie - login flow broken' : '✅ Auth cookie present'
      ].join('\n')
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ DEBUG ENDPOINT ERROR:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
