'use client';

/* ── In-memory GPS tracking data store ── */

export interface TechLocation {
  techId: string;
  techName: string;
  lat: number;
  lng: number;
  status: 'available' | 'en_route' | 'on_job';
  currentJobId?: string;
  batteryLevel: number;
  updatedAt: string;
}

export interface ArrivalNotification {
  id: string;
  jobId: string;
  customerName: string;
  techName: string;
  type: 'en_route' | 'ten_min' | 'arrived';
  sentAt: string;
}

// Austin, TX area base positions
const BASE_POSITIONS: Record<string, { lat: number; lng: number }> = {
  'TECH-001': { lat: 30.2672, lng: -97.7431 },  // Downtown
  'TECH-002': { lat: 30.2850, lng: -97.7320 },  // North
  'TECH-005': { lat: 30.2500, lng: -97.7550 },  // South
};

const TECH_NAMES: Record<string, string> = {
  'TECH-001': 'James Wilson',
  'TECH-002': 'Mike Torres',
  'TECH-005': 'Sarah Blake',
};

const JOB_ADDRESSES: Record<string, string> = {
  'JOB-001': '123 Oak St, Austin',
  'JOB-002': '456 Maple Ave, Austin',
  'JOB-004': '654 Birch Ln, Cedar Park',
  'JOB-005': '123 Oak St, Austin',
  'JOB-006': '4000 Spring Hollow Dr, Austin',
};

// ── In-memory state ──
let locations: TechLocation[] = [
  { techId: 'TECH-001', techName: 'James Wilson', lat: 30.2672, lng: -97.7431, status: 'available', batteryLevel: 87, updatedAt: new Date().toISOString() },
  { techId: 'TECH-002', techName: 'Mike Torres', lat: 30.2850, lng: -97.7320, status: 'on_job', currentJobId: 'JOB-002', batteryLevel: 62, updatedAt: new Date().toISOString() },
  { techId: 'TECH-005', techName: 'Sarah Blake', lat: 30.2500, lng: -97.7550, status: 'en_route', currentJobId: 'JOB-004', batteryLevel: 94, updatedAt: new Date().toISOString() },
];

let notifications: ArrivalNotification[] = [
  { id: 'NOTIF-001', jobId: 'JOB-002', customerName: 'Robert Davis', techName: 'Mike Torres', type: 'en_route', sentAt: new Date(Date.now() - 30*60000).toISOString() },
  { id: 'NOTIF-002', jobId: 'JOB-002', customerName: 'Robert Davis', techName: 'Mike Torres', type: 'ten_min', sentAt: new Date(Date.now() - 10*60000).toISOString() },
];

let notifCounter = 3;

// ── Public API ──

export function getTechLocations(): TechLocation[] {
  return [...locations];
}

export function updateTechLocation(techId: string, updates: Partial<TechLocation>): TechLocation | null {
  const idx = locations.findIndex(l => l.techId === techId);
  if (idx === -1) return null;
  locations[idx] = { ...locations[idx], ...updates, updatedAt: new Date().toISOString() };
  return locations[idx];
}

export function simulateLocationUpdate(): TechLocation[] {
  // Slightly nudge each tech's position to simulate movement
  locations = locations.map(loc => {
    const latShift = (Math.random() - 0.5) * 0.002;
    const lngShift = (Math.random() - 0.5) * 0.002;
    return {
      ...loc,
      lat: loc.lat + latShift,
      lng: loc.lng + lngShift,
      updatedAt: new Date().toISOString(),
    };
  });
  return [...locations];
}

export function startJob(techId: string, jobId: string): TechLocation | null {
  return updateTechLocation(techId, { status: 'on_job', currentJobId: jobId });
}

export function completeJob(techId: string): TechLocation | null {
  const notif: ArrivalNotification = {
    id: `NOTIF-${String(notifCounter++).padStart(3, '0')}`,
    jobId: locations.find(l => l.techId === techId)?.currentJobId || '',
    customerName: 'Customer',
    techName: TECH_NAMES[techId] || techId,
    type: 'arrived',
    sentAt: new Date().toISOString(),
  };
  notifications = [notif, ...notifications].slice(0, 50);
  
  return updateTechLocation(techId, { status: 'available', currentJobId: undefined });
}

export function getNotifications(): ArrivalNotification[] {
  return [...notifications];
}

export function getJobAddress(jobId: string): string {
  return JOB_ADDRESSES[jobId] || 'Unknown location';
}

export function getTechColor(status: string): string {
  switch (status) {
    case 'available': return '#22C55E';
    case 'en_route': return '#3B82F6';
    case 'on_job': return '#EF4444';
    default: return '#6B7280';
  }
}

export function getTechStatusLabel(status: string): string {
  switch (status) {
    case 'available': return 'Available';
    case 'en_route': return 'En Route';
    case 'on_job': return 'On Job';
    default: return status;
  }
}
