import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { mockPlumberProfiles } from '@/lib/plumber-profiles';
import type { PlumberProfile } from '@/lib/plumber-profiles';

/**
 * GET /api/plumber/profile?companyId=xxx
 * Returns the plumber profile for a given company
 * 
 * POST /api/plumber/profile — update profile fields
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const slug = searchParams.get('slug');

    const { getAdminClient } = await import('@/lib/supabase-admin');
    const admin = getAdminClient();

    if (admin) {
      let query = (admin as any).from('plumber_profiles').select('*');
      if (companyId) query = query.eq('company_id', companyId);
      if (slug) query = query.eq('slug', slug);
      const { data } = await query.single();

      if (data) {
        return NextResponse.json(data);
      }
    }

    // Fallback to mock
    if (companyId) {
      const profile = mockPlumberProfiles.find(p => p.company_id === companyId);
      if (profile) return NextResponse.json(profile);
    }
    if (slug) {
      const profile = mockPlumberProfiles.find(p => p.slug === slug);
      if (profile) return NextResponse.json(profile);
    }

    return NextResponse.json(mockPlumberProfiles[0]);
  } catch (err: any) {
    console.error('Profile GET error:', err);
    // Fallback to mock
    return NextResponse.json(mockPlumberProfiles[0]);
  }
}

export async function PATCH(req: Request) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { companyId, ...updates } = body;

    if (!companyId) {
      return NextResponse.json({ error: 'companyId required' }, { status: 400 });
    }

    const { getAdminClient } = await import('@/lib/supabase-admin');
    const admin = getAdminClient();

    if (admin) {
      const { data } = await (admin as any)
        .from('plumber_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('company_id', companyId)
        .select()
        .single();

      if (data) {
        return NextResponse.json(data);
      }
    }

    return NextResponse.json({ message: 'Profile updated (mock)', updates });
  } catch (err: any) {
    console.error('Profile PATCH error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
