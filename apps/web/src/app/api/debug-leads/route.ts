import { NextResponse } from 'next/server';

/**
 * PUBLIC ENDPOINT - TEMPORARY for testing lead creation
 * DO NOT use in production - this bypasses authentication!
 */
export async function GET(request: Request) {
  try {
    const { getAdminClient } = await import('@/lib/supabase-admin');
    const admin = getAdminClient();

    if (!admin) {
      return NextResponse.json({ 
        error: 'Supabase not configured',
        debug: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
          serviceRole: process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE ? 'SET' : 'MISSING'
        }
      }, { status: 500 });
    }

    const sb = admin as any;

    console.log('📊 LEADS DEBUG API: Fetching leads...');
    
    const { data: leads, error } = await sb
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ LEADS DEBUG API Error:', error.message);
      return NextResponse.json({ 
        error: 'Database query failed',
        details: error
      }, { status: 500 });
    }

    console.log(`✅ LEADS DEBUG API: Found ${leads?.length || 0} leads`);

    return NextResponse.json({
      success: true,
      count: leads?.length || 0,
      leads: leads || [],
      message: leads?.length ? 'Leads exist in database!' : 'Database is empty'
    });
  } catch (error: any) {
    console.error('❌ LEADS DEBUG API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
