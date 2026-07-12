/**
 * Lead Routing Algorithm for PlumbCore AI
 * 
 * Scores plumbers (0-100) within a radius based on:
 *   distance_score (40%) + availability_score (30%) + plan_tier_score (15%)
 *   + rating_score (10%) + response_speed_score (5%)
 */

export interface PlumberProfile {
  id: string;
  company_id: string;
  slug: string;
  name: string;
  email: string;
  phone: string;
  lat: number;
  lng: number;
  plan_tier: string;
  rating: number;       // 1-5
  active_jobs: number;
  max_jobs: number;
  avg_response_minutes: number;
}

export interface LeadData {
  id: string;
  stripe_session_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_lat?: number;
  customer_lng?: number;
  diagnosis: string;
  severity: string;
  total_estimate: number;
  deposit_paid: number;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'refunded';
  accepted_by?: string;
  created_at: string;
  expires_at: string;
}

/* ── Haversine distance ── */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/* ── Plan tier weight ── */
const PLAN_TIER_WEIGHTS: Record<string, number> = {
  enterprise: 100,
  business: 85,
  pro: 60,
  solo: 30,
  '': 0,
};

/* ── Scoring functions ── */
function distanceScore(distanceMiles: number, maxRadius: number): number {
  if (distanceMiles > maxRadius) return 0;
  return Math.max(0, (1 - distanceMiles / maxRadius) * 100);
}

function availabilityScore(activeJobs: number, maxJobs: number): number {
  if (maxJobs === 0) return 0;
  const ratio = activeJobs / maxJobs;
  if (ratio >= 1) return 0;
  return (1 - ratio) * 100;
}

function planTierScore(tier: string): number {
  return PLAN_TIER_WEIGHTS[tier] || 0;
}

function ratingScore(rating: number): number {
  return ((rating - 1) / 4) * 100;
}

function responseSpeedScore(avgResponseMinutes: number): number {
  if (avgResponseMinutes <= 0) return 100;
  if (avgResponseMinutes >= 120) return 0;
  return (1 - avgResponseMinutes / 120) * 100;
}

/* ── Main scoring ── */
export function calculateLeadScore(
  plumber: PlumberProfile,
  leadLat: number,
  leadLng: number,
  maxRadius: number
): { score: number; distance: number } {
  const distance = haversineDistance(plumber.lat, plumber.lng, leadLat, leadLng);
  if (distance > maxRadius) return { score: 0, distance };

  const dScore = distanceScore(distance, maxRadius);
  const aScore = availabilityScore(plumber.active_jobs, plumber.max_jobs);
  const pScore = planTierScore(plumber.plan_tier);
  const rScore = ratingScore(plumber.rating);
  const sScore = responseSpeedScore(plumber.avg_response_minutes);

  const score =
    dScore * 0.4 + aScore * 0.3 + pScore * 0.15 + rScore * 0.1 + sScore * 0.05;

  return { score: Math.round(score), distance };
}

/* ── Find top plumbers ── */
export function findTopPlumbers(
  plumbers: PlumberProfile[],
  leadLat: number,
  leadLng: number,
  radius: number,
  count: number = 3
): { plumber: PlumberProfile; score: number; distance: number }[] {
  const scored = plumbers
    .map((p) => {
      const { score, distance } = calculateLeadScore(p, leadLat, leadLng, radius);
      return { plumber: p, score, distance };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, count);

  return scored;
}

/* ── Radius expansion strategy ── */
export const ROUTING_CONFIG = {
  initialRadius: 25,     // miles
  expandedRadius: 50,    // miles
  notifyCount: 3,        // top N plumbers per round
  acceptTimerMinutes: 5, // how long plumbers have to accept
  autoRefundHours: 24,   // auto-refund if no one accepts
};
