/**
 * Quick diagnostic for plumber visibility
 */
import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase-admin';

export async function GET() {
  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: 'No DB' });

  const sb = admin as any;
  const result: any = {};

  // Check profiles table
  const { data: profiles, error: profilesError } = await sb
    .from('profiles')
    .select('id, full_name, email, role')
    .limit(50);
  result.profiles = { count: profiles?.length || 0, error: profilesError?.message || null, data: profiles };

  // Check auth_users with role tech/admin
  const { data: users } = await sb
    .from('auth_users')
    .select('id, full_name, email, role')
    .in('role', ['tech', 'admin'])
    .limit(50);
  result.authUsers = { count: users?.length || 0, data: users };

  return NextResponse.json(result);
}
