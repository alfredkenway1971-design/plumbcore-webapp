'use client';

/* ── Predictive Maintenance Data Store ── */

export interface Equipment {
  id: string;
  customerId: string;
  customerName: string;
  type: 'water_heater' | 'furnace' | 'hvac' | 'boiler' | 'sump_pump' | 'water_softener';
  brand: string;
  model: string;
  installDate: string;
  warrantyExpiry?: string;
  lastServiceDate?: string;
  notes?: string;
}

export interface Prediction {
  id: string;
  equipmentId: string;
  failureRiskScore: number; // 0-100
  predictedFailureDate: string;
  recommendedAction: string;
  confidence: number; // 0-100
  acknowledged: boolean;
  createdAt: string;
}

// Equipment lifespan in years
const LIFESPAN: Record<string, number> = {
  water_heater: 12,
  furnace: 20,
  hvac: 15,
  boiler: 30,
  sump_pump: 10,
  water_softener: 15,
};

const AVG_COST: Record<string, number> = {
  water_heater: 1200,
  furnace: 3500,
  hvac: 5000,
  boiler: 6000,
  sump_pump: 800,
  water_softener: 1500,
};

// ── Seed data ──
let equipment: Equipment[] = [
  { id: 'EQ-001', customerId: 'CLT-001', customerName: 'James & Sarah Johnson', type: 'water_heater', brand: 'Rheem', model: 'XG40T06EC', installDate: '2016-03-15', warrantyExpiry: '2026-03-15', lastServiceDate: '2025-11-20', notes: 'Second floor utility closet' },
  { id: 'EQ-002', customerId: 'CLT-002', customerName: 'Robert Davis', type: 'furnace', brand: 'Carrier', model: '59SC2D', installDate: '2010-10-01', lastServiceDate: '2024-01-15' },
  { id: 'EQ-003', customerId: 'CLT-003', customerName: 'Maria Wilson', type: 'water_heater', brand: 'Bradford White', model: 'RG240T6N', installDate: '2020-06-20', warrantyExpiry: '2030-06-20', lastServiceDate: '2025-08-10' },
  { id: 'EQ-004', customerId: 'CLT-005', customerName: 'Emily Thompson', type: 'hvac', brand: 'Trane', model: 'XV20i', installDate: '2018-04-10', warrantyExpiry: '2028-04-10', lastServiceDate: '2026-03-01' },
  { id: 'EQ-005', customerId: 'CLT-011', customerName: 'Oak Springs Apartments', type: 'boiler', brand: 'Weil-McLain', model: 'GV90+', installDate: '2008-09-15', lastServiceDate: '2025-12-01' },
  { id: 'EQ-006', customerId: 'CLT-015', customerName: 'Sunset Retirement Home', type: 'sump_pump', brand: 'Zoeller', model: 'M53', installDate: '2019-11-01', lastServiceDate: '2026-02-15' },
];

let predictions: Prediction[] = [];

let eqCounter = 7;
let predCounter = 1;

function yearsSince(dateStr: string): number {
  return (Date.now() - new Date(dateStr).getTime()) / (365.25 * 86400 * 1000);
}

function calculateRisk(eq: Equipment): Prediction {
  const age = yearsSince(eq.installDate);
  const maxLife = LIFESPAN[eq.type] || 15;
  const ageRatio = age / maxLife;

  // Base risk from age
  let score = Math.round(ageRatio * 70);

  // Service history bonus (lack of service = higher risk)
  if (!eq.lastServiceDate) {
    score += 15;
  } else {
    const sinceService = yearsSince(eq.lastServiceDate);
    if (sinceService > 2) score += 10;
    if (sinceService > 1) score += 5;
  }

  // Warranty expired = higher risk
  if (eq.warrantyExpiry && new Date(eq.warrantyExpiry) < new Date()) {
    score += 10;
  }

  // Cap at 98
  score = Math.min(98, Math.max(5, score));

  // Predicted failure: age + (100-score)/10 years
  const yearsToFailure = Math.max(0.5, (100 - score) / 10);
  const failureDate = new Date();
  failureDate.setFullYear(failureDate.getFullYear() + Math.ceil(yearsToFailure));

  const avgCost = AVG_COST[eq.type] || 1000;

  const actions: Record<string, string[]> = {
    water_heater: ['Flush tank and check anode rod', 'Test pressure relief valve', 'Inspect for sediment buildup'],
    furnace: ['Clean burners and heat exchanger', 'Replace air filter', 'Check carbon monoxide levels'],
    hvac: ['Clean condenser coils', 'Check refrigerant levels', 'Inspect ductwork for leaks'],
    boiler: ['Flush system and check pressure', 'Inspect heat exchanger', 'Test safety valves'],
    sump_pump: ['Test pump operation', 'Clean intake screen', 'Check backup battery'],
    water_softener: ['Check resin bed condition', 'Clean brine tank', 'Test water hardness levels'],
  };

  const eqActions = actions[eq.type] || ['Schedule inspection'];
  const action = score > 70
    ? `URGENT: ${eqActions[0]}. Estimated replacement cost: $${avgCost}`
    : score > 40
    ? `Recommend: ${eqActions[0]}. Estimated repair: $${Math.round(avgCost * 0.3)}`
    : `Monitor: ${eqActions[0]} during next visit`;

  return {
    id: `PRED-${String(predCounter++).padStart(3, '0')}`,
    equipmentId: eq.id,
    failureRiskScore: score,
    predictedFailureDate: failureDate.toISOString().split('T')[0],
    recommendedAction: action,
    confidence: Math.round(70 + Math.random() * 20),
    acknowledged: false,
    createdAt: new Date().toISOString(),
  };
}

// Generate initial predictions
equipment.forEach(eq => {
  predictions.push(calculateRisk(eq));
});

// ── Public API ──

export function getEquipment(): Equipment[] {
  return [...equipment];
}

export function addEquipment(eq: Omit<Equipment, 'id'>): Equipment {
  const newEq: Equipment = { ...eq, id: `EQ-${String(eqCounter++).padStart(3, '0')}` };
  equipment.push(newEq);
  predictions.push(calculateRisk(newEq));
  return newEq;
}

export function getPredictions(): Prediction[] {
  return [...predictions];
}

export function acknowledgePrediction(predId: string): Prediction | null {
  const idx = predictions.findIndex(p => p.id === predId);
  if (idx === -1) return null;
  predictions[idx] = { ...predictions[idx], acknowledged: true };
  return predictions[idx];
}

export function getStats() {
  const total = predictions.length;
  const critical = predictions.filter(p => p.failureRiskScore > 70 && !p.acknowledged).length;
  const warning = predictions.filter(p => p.failureRiskScore > 40 && p.failureRiskScore <= 70 && !p.acknowledged).length;
  const good = predictions.filter(p => p.failureRiskScore <= 40 && !p.acknowledged).length;
  const avgRisk = Math.round(predictions.reduce((s, p) => s + p.failureRiskScore, 0) / total);

  // Estimate preventive revenue
  const preventiveRevenue = predictions
    .filter(p => p.failureRiskScore > 40 && !p.acknowledged)
    .reduce((sum, p) => {
      const eq = equipment.find(e => e.id === p.equipmentId);
      return sum + (eq ? Math.round((AVG_COST[eq.type] || 1000) * 0.15) : 150);
    }, 0);

  return { total, critical, warning, good, avgRisk, preventiveRevenue, potentialJobs: critical + warning };
}

export function getRiskColor(score: number): string {
  if (score > 70) return '#EF4444';
  if (score > 40) return '#F59E0B';
  return '#22C55E';
}

export function getRiskLabel(score: number): string {
  if (score > 70) return 'Critical';
  if (score > 40) return 'Warning';
  return 'Good';
}
