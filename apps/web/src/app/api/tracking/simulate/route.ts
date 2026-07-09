import { NextResponse } from 'next/server';
import { simulateLocationUpdate } from '@/lib/trackingDb';

/* ── POST /api/tracking/simulate — nudge all tech GPS positions ── */
export async function POST() {
  const locations = simulateLocationUpdate();
  return NextResponse.json({ ok: true, locations, timestamp: new Date().toISOString() });
}
