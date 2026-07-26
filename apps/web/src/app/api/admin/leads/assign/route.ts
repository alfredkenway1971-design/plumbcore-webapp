/**
 * POST /api/admin/leads/assign
 * Admin assigns a lead to a plumber
 */
import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const { leadId, plumberId, plumberName, mode } = await req.json();

    if (!leadId || !plumberId) {
      return NextResponse.json({ error: 'leadId and plumberId required' }, { status: 400 });
    }

    const admin = getAdminClient();
    if (!admin) {
      return NextResponse.json({ error: 'DB not configured' }, { status: 500 });
    }

    // Update the lead with assigned plumber
    const { error } = await (admin as any)
      .from('leads')
      .update({
        assigned_plumber_id: plumberId,
        assigned_plumber_name: plumberName || '',
        status: 'assigned',
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId);

    if (error) {
      console.error('Lead assignment error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Lead assigned to ${plumberName || plumberId}`,
      mode: mode || 'manual',
    });
  } catch (err: any) {
    console.error('Assign error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
