import { NextRequest, NextResponse } from 'next/server';
import {
  getTechLocations,
  updateTechLocation,
  getNotifications,
  startJob,
  completeJob,
} from '@/lib/trackingDb';

/* ── GET /api/tracking — list all tech locations + notifications ── */
export async function GET() {
  const locations = getTechLocations();
  const notifications = getNotifications();
  return NextResponse.json({ locations, notifications });
}

/* ── POST /api/tracking — update location or start/complete job ── */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { techId, lat, lng, status, currentJobId, action, jobId } = body;

    if (!techId) {
      return NextResponse.json({ error: 'techId is required' }, { status: 400 });
    }

    if (action === 'start_job') {
      const updated = startJob(techId, jobId || '');
      if (!updated) {
        return NextResponse.json({ error: `Tech ${techId} not found` }, { status: 404 });
      }
      return NextResponse.json({ location: updated });
    }

    if (action === 'complete_job') {
      const updated = completeJob(techId);
      if (!updated) {
        return NextResponse.json({ error: `Tech ${techId} not found` }, { status: 404 });
      }
      return NextResponse.json({ location: updated });
    }

    const updated = updateTechLocation(techId, {
      lat: lat ?? undefined,
      lng: lng ?? undefined,
      status: status ?? undefined,
      currentJobId: currentJobId ?? undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: `Tech ${techId} not found` }, { status: 404 });
    }

    return NextResponse.json({ location: updated });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
