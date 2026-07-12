import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { getAdminClient } from '@/lib/supabase-admin';

export async function PUT(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const admin = getAdminClient();
    if (!admin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const sb = admin as any;

    // Update profile fields
    if (body.full_name !== undefined || body.phone !== undefined) {
      const profileUpdates: Record<string, string> = {};
      if (body.full_name !== undefined) profileUpdates.full_name = body.full_name;
      if (body.phone !== undefined) profileUpdates.phone = body.phone;
      await sb.from('profiles').update(profileUpdates).eq('id', auth.userId);
    }

    // Update company fields
    const companyUpdates: Record<string, any> = {};
    const companyFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'zip', 'logo_url', 'timezone', 'website'];
    for (const field of companyFields) {
      if (body[field] !== undefined) companyUpdates[field] = body[field];
    }
    if (Object.keys(companyUpdates).length > 0) {
      await sb.from('companies').update(companyUpdates).eq('id', auth.companyId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Update settings error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update settings' }, { status: 500 });
  }
}
