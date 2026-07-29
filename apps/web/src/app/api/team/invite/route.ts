import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { getAdminClient } from '@/lib/supabase-admin';
import { sendEmail, teamInviteEmail } from '@/lib/email';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://plumbcore-ai.vercel.app';

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

    // Get company name and inviter name for the email
    let companyName = 'their company';
    let invitedByName = 'A team member';
    try {
      const { data: company } = await sb.from('companies').select('name').eq('id', auth.companyId).single();
      if (company?.name) companyName = company.name;
      const { data: profile } = await sb.from('profiles').select('full_name').eq('id', auth.userId).single();
      if (profile?.full_name) invitedByName = profile.full_name;
    } catch {}

    // Send invitation email
    const inviteLink = `${APP_URL}/signup?email=${encodeURIComponent(email)}&team=${auth.companyId}&role=${role || 'tech'}`;
    const emailContent = teamInviteEmail({
      invitedByName,
      companyName,
      inviteLink,
      role: (role || 'tech').replace('-', ' '),
    });
    await sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    return NextResponse.json({ success: true, memberId: data?.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to invite member' }, { status: 500 });
  }
}
