/**
 * POST /api/admin/setup-companies-and-profiles
 * Creates company records + profiles for all existing auth_users
 * Run ONCE to fix the empty companies and profiles tables
 */
import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase-admin';

export async function POST() {
  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: 'DB not configured' }, { status: 500 });

  const sb = admin as any;
  const results: any[] = [];

  const { data: users } = await sb
    .from('auth_users')
    .select('id, email, full_name, company_id, phone, role, company_name, company_slug')
    .limit(50);

  for (const user of users || []) {
    try {
      const companyId = user.company_id;
      if (!companyId) continue;

      // 1. Create company record if not exists
      try {
        await sb.from('companies').upsert({
          id: companyId,
          name: user.company_name || user.full_name || user.email?.split('@')[0] || 'Company',
          slug: user.company_slug || (user.full_name || 'company').toLowerCase().replace(/\s+/g, '-'),
          email: user.email || '',
          subscription_tier: 'solo',
        }, { onConflict: 'id', ignoreDuplicates: false });
      } catch (ce: any) {
        if (!ce.message?.includes('duplicate')) throw ce;
      }

      // 2. Create profile if not exists
      const { data: existing } = await sb
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!existing) {
        await sb.from('profiles').insert({
          id: user.id,
          company_id: companyId,
          email: user.email || '',
          full_name: user.full_name || user.email?.split('@')[0] || 'User',
          name: user.full_name || user.email?.split('@')[0] || 'User',
          phone: user.phone || '',
          role: 'plumber',
          specialties: [],
          rating: 4.5,
          avg_rating: 4.5,
          jobs_completed: 0,
          jobsCompleted: 0,
          available: true,
          is_active: true,
          service_zips: [],
          serviceZips: [],
          rotation_order: 0,
          rotationOrder: 0,
        });
      }

      results.push({ email: user.email, name: user.full_name, status: existing ? 'already_exists' : 'created' });
    } catch (e: any) {
      results.push({ email: user.email, status: 'error', error: e.message?.substring(0, 100) });
    }
  }

  return NextResponse.json({
    success: true,
    total: users?.length || 0,
    created: results.filter(r => r.status === 'created').length,
    results,
  });
}
