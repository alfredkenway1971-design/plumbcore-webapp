/**
 * POST /api/admin/seed-plumbers
 * Seeds plumber profiles into the database so leads can be assigned
 */
import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase-admin';

const PLUMBERS = [
  {
    id: 'plumber-001',
    full_name: 'Marco Rossi',
    name: 'Marco Rossi',
    email: 'marco@plumbcore.com',
    phone: '(514) 555-0101',
    role: 'plumber',
    specialties: ['drain cleaning', 'pipe repair', 'water heater install'],
    rating: 4.8,
    avg_rating: 4.8,
    jobs_completed: 147,
    jobsCompleted: 147,
    available: true,
    service_zips: ['H2X', 'H3A', 'H4B'],
    serviceZips: ['H2X', 'H3A', 'H4B'],
    rotation_order: 1,
    rotationOrder: 1,
    is_active: true,
  },
  {
    id: 'plumber-002',
    full_name: 'Sarah Chen',
    name: 'Sarah Chen',
    email: 'sarah@plumbcore.com',
    phone: '(514) 555-0102',
    role: 'plumber',
    specialties: ['faucet repair', 'toilet install', 'emergency service'],
    rating: 4.9,
    avg_rating: 4.9,
    jobs_completed: 203,
    jobsCompleted: 203,
    available: true,
    service_zips: ['H1A', 'H2B', 'H3C'],
    serviceZips: ['H1A', 'H2B', 'H3C'],
    rotation_order: 2,
    rotationOrder: 2,
    is_active: true,
  },
  {
    id: 'plumber-003',
    full_name: 'James Wilson',
    name: 'James Wilson',
    email: 'james@plumbcore.com',
    phone: '(514) 555-0103',
    role: 'plumber',
    specialties: ['sewer line', 'hydrojetting', 'pipe replacement'],
    rating: 4.7,
    avg_rating: 4.7,
    jobs_completed: 89,
    jobsCompleted: 89,
    available: true,
    service_zips: ['H4A', 'H5B', 'H6C'],
    serviceZips: ['H4A', 'H5B', 'H6C'],
    rotation_order: 3,
    rotationOrder: 3,
    is_active: true,
  },
  {
    id: 'plumber-004',
    full_name: 'Emily Tremblay',
    name: 'Emily Tremblay',
    email: 'emily@plumbcore.com',
    phone: '(514) 555-0104',
    role: 'plumber',
    specialties: ['gas fitting', 'water heater', 'backflow prevention'],
    rating: 4.6,
    avg_rating: 4.6,
    jobs_completed: 56,
    jobsCompleted: 56,
    available: true,
    service_zips: ['H7A', 'H8B', 'H9C'],
    serviceZips: ['H7A', 'H8B', 'H9C'],
    rotation_order: 4,
    rotationOrder: 4,
    is_active: true,
  },
  {
    id: 'plumber-005',
    full_name: 'David Park',
    name: 'David Park',
    email: 'david@plumbcore.com',
    phone: '(514) 555-0105',
    role: 'plumber',
    specialties: ['remodel plumbing', 'fixture install', 'bathroom renovation'],
    rating: 4.5,
    avg_rating: 4.5,
    jobs_completed: 112,
    jobsCompleted: 112,
    available: true,
    service_zips: ['J0K', 'J1L', 'J2M'],
    serviceZips: ['J0K', 'J1L', 'J2M'],
    rotation_order: 5,
    rotationOrder: 5,
    is_active: true,
  },
];

export async function POST() {
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'DB not configured' }, { status: 500 });
  }

  const sb = admin as any;
  const results: { name: string; status: string; error?: string }[] = [];

  for (const plumber of PLUMBERS) {
    try {
      // Check if plumber already exists
      const { data: existing } = await sb
        .from('profiles')
        .select('id')
        .eq('id', plumber.id)
        .maybeSingle();

      if (existing) {
        // Update existing
        await sb.from('profiles').update(plumber).eq('id', plumber.id);
        results.push({ name: plumber.full_name, status: 'updated' });
      } else {
        // Insert new
        await sb.from('profiles').insert({
          ...plumber,
          created_at: new Date().toISOString(),
        });
        results.push({ name: plumber.full_name, status: 'created' });
      }
    } catch (e: any) {
      results.push({ name: plumber.full_name, status: 'error', error: e.message });
    }
  }

  return NextResponse.json({
    success: true,
    count: results.length,
    results,
  });
}
