// API route to set a user's role (protected by ADMIN_SECRET)
import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { email, role, secret } = await request.json();

    // Protect with admin secret
    const expectedSecret = process.env.ADMIN_SECRET || 'plumbcore-admin-secret-2026';
    if (secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role required' }, { status: 400 });
    }

    const validRoles = ['super_admin', 'admin', 'dispatcher', 'tech', 'lead-tech', 'accountant'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }, { status: 400 });
    }

    const admin = getAdminClient();
    if (!admin) {
      return NextResponse.json({ error: 'Admin client not available' }, { status: 500 });
    }

    const sb = admin as any;

    // Update auth_users table
    const { data, error } = await sb
      .from('auth_users')
      .update({ role })
      .eq('email', email.toLowerCase())
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      // User not found in auth_users. Try profiles table directly.
      const { data: profileData, error: profileError } = await sb
        .from('profiles')
        .update({ role })
        .eq('email', email.toLowerCase())
        .select();

      if (profileError || !profileData || profileData.length === 0) {
        return NextResponse.json({
          success: false,
          message: `No user found with email ${email} in auth_users or profiles. They need to sign up first.`,
        });
      }

      return NextResponse.json({
        success: true,
        message: `User ${email} role set to ${role} (profiles table)`,
        user: profileData[0],
      });
    }

    // Also update profiles table
    await sb
      .from('profiles')
      .update({ role })
      .eq('email', email.toLowerCase());

    return NextResponse.json({
      success: true,
      message: `User ${email} role set to ${role}`,
      user: data,
    });
  } catch (error) {
    console.error('Set role error:', error);
    return NextResponse.json({ error: 'Failed to set role' }, { status: 500 });
  }
}
