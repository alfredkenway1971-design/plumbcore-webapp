import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { getAdminClient } from '@/lib/supabase-admin';
import { sendEmail, teamInviteEmail } from '@/lib/email';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { name, email, role } = await request.json();
    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Missing required fields: name, email, role' }, { status: 400 });
    }

    // Extract company name and inviter name from session token
    // The JWT token carries the full session data
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    let companyName = 'your company';
    let invitedByName = auth.email;

    // Decode the JWT payload to get profile + company info
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
        companyName = payload?.company?.name || payload?.profile?.company_name || companyName;
        invitedByName = payload?.profile?.full_name || payload?.user?.email || invitedByName;
      }
    } catch {
      // Fallback to defaults
    }

    // Try Supabase admin if available (production)
    const admin = getAdminClient();
    if (admin) {
      const sb = admin as any;

      // Get the inviter's company info from DB
      const { data: company } = await sb
        .from('companies')
        .select('name')
        .eq('id', auth.companyId)
        .single();

      if (company?.name) {
        companyName = company.name;
      }

      // Get the inviter's profile name from DB
      const { data: inviterProfile } = await sb
        .from('profiles')
        .select('full_name')
        .eq('id', auth.userId)
        .single();

      if (inviterProfile?.full_name) {
        invitedByName = inviterProfile.full_name;
      }
    }

    // Generate invite token
    const inviteToken = randomBytes(32).toString('hex');
    const HOURS = 7 * 24; // 7 days expiry

    // Store invite in DB if admin is available
    if (admin) {
      const { error: insertError } = await (admin as any)
        .from('team_invites')
        .upsert({
          company_id: auth.companyId,
          invited_by: auth.userId,
          email: email.toLowerCase().trim(),
          name: name.trim(),
          role: role,
          token: inviteToken,
          expires_at: new Date(Date.now() + HOURS * 60 * 60 * 1000).toISOString(),
          status: 'pending',
        }, { onConflict: 'email,company_id', ignoreDuplicates: false });

      if (insertError) {
        console.warn('[Invite] Could not store invite (table may not exist):', insertError.message);
      }
    }

    // Send the invite email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://plumbcore-ai.vercel.app';
    const inviteLink = `${baseUrl}/signup?invite=${inviteToken}&company=${auth.companyId}&email=${encodeURIComponent(email.toLowerCase().trim())}&role=${role}`;

    const emailContent = teamInviteEmail({
      invitedByName,
      companyName,
      inviteLink,
      role,
    });

    const sent = await sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (!sent) {
      console.warn('[Invite] Email send returned false — Resend may not be configured');
    }

    return NextResponse.json({
      success: true,
      message: sent
        ? `Invitation sent to ${email}`
        : `Invite created — email sending requires Resend API key`,
      emailSent: sent,
      inviteLink, // Include in dev so we can test manually
    });
  } catch (err: any) {
    console.error('Team invite error:', err);
    return NextResponse.json({ error: err.message || 'Failed to send invitation' }, { status: 500 });
  }
}
