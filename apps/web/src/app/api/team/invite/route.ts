import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { getAdminClient } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { name, email, role } = await request.json();
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const admin = getAdminClient();
    if (!admin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const sb = admin as any;

    // Insert team member
    const { data, error } = await sb
      .from('team_members')
      .insert({
        company_id: auth.companyId,
        name,
        email,
        role: role || 'tech',
        status: 'invited',
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, memberId: data?.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to invite member' }, { status: 500 });
  }
}
