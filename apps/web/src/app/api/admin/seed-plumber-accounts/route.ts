/**
 * POST /api/admin/seed-plumber-accounts
 * Creates auth accounts + company records for seeded plumbers
 */
import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase-admin';
import { hashPw, buildSession, createSessionToken } from '@/lib/custom-auth';
import { randomUUID } from 'crypto';

const PLUMBER_ACCOUNTS = [
  { id: 'plumber-auth-001', email: 'marco@rossiplumbing.com', name: 'Marco Rossi', phone: '+15145550101', profileId: 'plumber-001', companySlug: 'rossi-plumbing' },
  { id: 'plumber-auth-002', email: 'sarah@chenplumbing.com', name: 'Sarah Chen', phone: '+15145550102', profileId: 'plumber-002', companySlug: 'chen-plumbing' },
  { id: 'plumber-auth-003', email: 'james@wilsonhydro.com', name: 'James Wilson', phone: '+15145550103', profileId: 'plumber-003', companySlug: 'wilson-hydro' },
  { id: 'plumber-auth-004', email: 'emily@tremblayplumbing.com', name: 'Emily Tremblay', phone: '+15145550104', profileId: 'plumber-004', companySlug: 'tremblay-plumbing' },
  { id: 'plumber-auth-005', email: 'david@parkplumbing.com', name: 'David Park', phone: '+15145550105', profileId: 'plumber-005', companySlug: 'park-plumbing' },
];

export async function POST() {
  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: 'DB not configured' }, { status: 500 });

  const sb = admin as any;
  const defaultPassword = 'Plumber123!';
  const results: any[] = [];

  for (const acct of PLUMBER_ACCOUNTS) {
    try {
      const companyId = randomUUID();
      const passwordHash = hashPw(defaultPassword);

      // Create company
      try {
        await sb.from('companies').insert({
          id: companyId,
          name: `${acct.name}'s Plumbing`,
          slug: acct.companySlug,
          subscription_tier: 'pro',
        });
      } catch (ce: any) {
        if (!ce.message?.includes('duplicate')) throw ce;
      }

      // Create auth user
      try {
        await sb.from('auth_users').insert({
          id: acct.id,
          email: acct.email,
          password_hash: passwordHash,
          full_name: acct.name,
          company_name: `${acct.name}'s Plumbing`,
          company_slug: acct.companySlug,
          company_id: companyId,
          phone: acct.phone,
          role: 'plumber',
          subscription_tier: 'pro',
        });
      } catch (ae: any) {
        if (!ae.message?.includes('duplicate')) throw ae;
      }

      // Update existing profile with correct company_id
      await sb.from('profiles').update({
        company_id: companyId,
        email: acct.email,
        is_active: true,
      }).eq('id', acct.profileId);

      results.push({ email: acct.email, name: acct.name, status: 'created', companyId });
    } catch (e: any) {
      results.push({ email: acct.email, name: acct.name, status: 'error', error: e.message });
    }
  }

  return NextResponse.json({
    success: true,
    message: `Created ${results.filter(r => r.status === 'created').length} plumber accounts`,
    results,
    defaultPassword,
  });
}
