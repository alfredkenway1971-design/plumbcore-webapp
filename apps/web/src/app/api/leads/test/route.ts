import { NextRequest, NextResponse } from 'next/server';

/**
 * PUBLIC LEADS TEST - Fetches all leads without auth
 */
export async function GET(request: NextRequest) {
  try {
    const { getAdminClient } = await import('@/lib/supabase-admin');
    const admin = getAdminClient();

    if (!admin) {
      return NextResponse.json({ 
        error: 'Supabase not configured',
        debug: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING',
          serviceRole: process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE ? 'SET' : 'MISSING'
        }
      }, { status: 500 });
    }

    const sb = admin as any;

    console.log('🔍 Public API /leads/test: Fetching all leads...');
    
    const { data, error } = await sb
      .from('leads')
      .select('id, customer_name, customer_email, status, tracking_token, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Query error:', error.message);
      return NextResponse.json({ 
        error: error.message,
        details: error
      }, { status: 500 });
    }

    console.log(`✅ SUCCESS: Found ${data?.length || 0} leads`);
    
    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      leads: data || [],
      message: data?.length ? '✅ Leads found: ' + data.length : '❌ No leads in database'
    });
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    return NextResponse.json({ 
      error: 'Internal error',
      details: error.message 
    }, { status: 500 });
  }
}

// Allow POST too
export async function POST(request: NextRequest) {
  // Just redirect GET, POST not needed for test
  return NextResponse.json({ error: 'Use GET method' }, { status: 405 });
}
