/**
 * POST /api/admin/link-plumber-profiles
 * Creates profiles for existing auth_users with role=tech so they appear in the admin leads dispatch
 */
import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase-admin';

export async function POST() {
  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: 'DB not configured' }, { status: 500 });

  const sb = admin as any;
  const results: any[] = [];

  // Get all auth_users with role = tech or admin (these are the plumbers)
  const { data: users } = await sb
    .from('auth_users')
    .select('id, email, full_name, company_id, phone, role')
    .in('role', ['tech', 'admin'])
    .limit(50);

  const plumberUsers = users || [];

  for (const user of plumberUsers) {
    try {
      // Check if profile already exists
      const { data: existing } = await sb
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (existing) {
        results.push({ email: user.email, status: 'already_exists' });
        continue;
      }

      // Create profile for this user
      await sb.from('profiles').insert({
        id: user.id,
        company_id: user.company_id || user.id,
        email: user.email || '',
        full_name: user.full_name || user.email?.split('@')[0] || 'Plumber',
        name: user.full_name || user.email?.split('@')[0] || 'Plumber',
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

      results.push({ email: user.email, name: user.full_name, status: 'profile_created' });
    } catch (e: any) {
      results.push({ email: user.email, status: 'error', error: e.message });
    }
  }

  return NextResponse.json({
    success: true,
    total: plumberUsers.length,
    created: results.filter(r => r.status === 'profile_created').length,
    results,
  });
}
