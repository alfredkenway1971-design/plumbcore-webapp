/**
 * POST /api/admin/cleanup-seed-data
 * Removes the fake plumber profiles and accounts that were incorrectly seeded
 */
import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase-admin';

export async function POST() {
  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: 'DB not configured' }, { status: 500 });

  const sb = admin as any;
  const cleanup: any[] = [];

  // Delete fake plumber profiles
  const fakeIds = ['plumber-001', 'plumber-002', 'plumber-003', 'plumber-004', 'plumber-005'];
  for (const id of fakeIds) {
    try {
      await sb.from('profiles').delete().eq('id', id);
      cleanup.push({ profile: id, status: 'deleted' });
    } catch { /* ignore */ }
  }

  // Delete fake auth accounts
  const fakeEmails = [
    'marco@rossiplumbing.com', 'sarah@chenplumbing.com',
    'james@wilsonhydro.com', 'emily@tremblayplumbing.com', 'david@parkplumbing.com',
  ];
  for (const email of fakeEmails) {
    try {
      await sb.from('auth_users').delete().eq('email', email);
      cleanup.push({ auth: email, status: 'deleted' });
    } catch { /* ignore */ }
  }

  // Delete fake companies
  const fakeSlugs = ['rossi-plumbing', 'chen-plumbing', 'wilson-hydro', 'tremblay-plumbing', 'park-plumbing'];
  for (const slug of fakeSlugs) {
    try {
      await sb.from('companies').delete().eq('slug', slug);
      cleanup.push({ company: slug, status: 'deleted' });
    } catch { /* ignore */ }
  }

  return NextResponse.json({ success: true, cleanup });
}
