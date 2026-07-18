/**
 * Feature gating by subscription tier (plan).
 * 
 * Tiers: solo, pro, business, enterprise (or empty = no plan)
 *
 * Feature availability matrix:
 *                       Solo      Pro     Business   Enterprise
 * AI Photo Estimates    ✓         ✓       ✓          ✓
 * Scheduling/Invoicing  ✓         ✓       ✓          ✓
 * AI Receptionist       15hrs    60hrs   150hrs     Custom
 * Voice-to-Invoice      ✗         ✓       ✓          ✓
 * Route Optimization    ✗         ✓       ✓          ✓
 * Inventory Tracking    ✗         ✓       ✓          ✓
 * Maintenance Plans     ✗         ✓       ✓          ✓
 * Review Automation     ✗         ✓       ✓          ✓
 * Customer Financing    ✗         ✗       ✓          ✓
 * Truck GPS             ✗         ✗       ✓          ✓
 * Predictive Maint.     ✗         ✗       ✗          ✓
 * White-Label Portal    ✗         ✗       ✗          ✓
 */

export type PlanTier = 'solo' | 'pro' | 'business' | 'enterprise' | '';

export type PlanFeatures = {
  aiPhotoEstimates: boolean;
  schedulingInvoicing: boolean;
  aiReceptionistHours: number;
  voiceToInvoice: boolean;
  routeOptimization: boolean;
  inventoryTracking: boolean;
  maintenancePlans: boolean;
  reviewAutomation: boolean;
  customerFinancing: boolean;
  truckGps: boolean;
  predictiveMaintenance: boolean;
  whiteLabelPortal: boolean;
  subdomainQuote: boolean;
  embedQuote: boolean;
  leadRouting: boolean;
  dedicatedManager: boolean;
  customIntegrations: boolean;
  maxTechs: number | null; // null = unlimited
}

export const PLAN_FEATURES: Record<string, PlanFeatures> = {
  solo: {
    aiPhotoEstimates: true,
    schedulingInvoicing: true,
    aiReceptionistHours: 15,
    voiceToInvoice: false,
    routeOptimization: false,
    inventoryTracking: false,
    maintenancePlans: false,
    reviewAutomation: false,
    customerFinancing: false,
    truckGps: false,
    predictiveMaintenance: false,
    whiteLabelPortal: false,
    subdomainQuote: false,
    embedQuote: false,
    leadRouting: true,
    dedicatedManager: false,
    customIntegrations: false,
    maxTechs: 1,
  },
  pro: {
    aiPhotoEstimates: true,
    schedulingInvoicing: true,
    aiReceptionistHours: 60,
    voiceToInvoice: true,
    routeOptimization: true,
    inventoryTracking: true,
    maintenancePlans: true,
    reviewAutomation: true,
    customerFinancing: false,
    truckGps: false,
    predictiveMaintenance: false,
    whiteLabelPortal: false,
    subdomainQuote: true,
    embedQuote: false,
    leadRouting: true,
    dedicatedManager: false,
    customIntegrations: false,
    maxTechs: 10,
  },
  business: {
    aiPhotoEstimates: true,
    schedulingInvoicing: true,
    aiReceptionistHours: 150,
    voiceToInvoice: true,
    routeOptimization: true,
    inventoryTracking: true,
    maintenancePlans: true,
    reviewAutomation: true,
    customerFinancing: true,
    truckGps: true,
    predictiveMaintenance: false,
    whiteLabelPortal: false,
    subdomainQuote: true,
    embedQuote: true,
    leadRouting: true,
    dedicatedManager: false,
    customIntegrations: false,
    maxTechs: 25,
  },
  enterprise: {
    aiPhotoEstimates: true,
    schedulingInvoicing: true,
    aiReceptionistHours: 9999,
    voiceToInvoice: true,
    routeOptimization: true,
    inventoryTracking: true,
    maintenancePlans: true,
    reviewAutomation: true,
    customerFinancing: true,
    truckGps: true,
    predictiveMaintenance: true,
    whiteLabelPortal: true,
    subdomainQuote: true,
    embedQuote: true,
    leadRouting: true,
    dedicatedManager: true,
    customIntegrations: true,
    maxTechs: null,
  },
};

export const EMPTY_PLAN: PlanFeatures = {
  aiPhotoEstimates: false,
  schedulingInvoicing: false,
  aiReceptionistHours: 0,
  voiceToInvoice: false,
  routeOptimization: false,
  inventoryTracking: false,
  maintenancePlans: false,
  reviewAutomation: false,
  customerFinancing: false,
  truckGps: false,
  predictiveMaintenance: false,
  whiteLabelPortal: false,
  subdomainQuote: false,
  embedQuote: false,
  leadRouting: false,
  dedicatedManager: false,
  customIntegrations: false,
  maxTechs: 0,
};

export function getPlanFeatures(tier: PlanTier | string): PlanFeatures {
  return PLAN_FEATURES[tier] || EMPTY_PLAN;
}

export function canAccess(tier: PlanTier | string, feature: string): boolean {
  const features = getPlanFeatures(tier);
  return !!(features as any)[feature];
}

export const PLAN_PRICING: Record<string, { label: string; price: number; priceLabel: string }> = {
  solo: { label: 'Solo', price: 349, priceLabel: '$349/mo' },
  pro: { label: 'Pro', price: 799, priceLabel: '$799/mo' },
  business: { label: 'Business', price: 1499, priceLabel: '$1,499/mo' },
  enterprise: { label: 'Enterprise', price: 0, priceLabel: 'Contact Us' },
};

export const PLAN_ORDER = ['solo', 'pro', 'business', 'enterprise'] as const;

/** Stripe price IDs for subscription plans */
export const STRIPE_PRICE_IDS: Record<string, string> = {
  solo: 'price_1TuQUYDynIU5fZLW6MxilPV8',
  pro: 'price_1TuQUeDynIU5fZLW1JsCNK1f',
  business: 'price_1TuQUjDynIU5fZLWGVfhiHQg',
};

/** Stripe deposit price IDs for one-time charges */
export const DEPOSIT_PRICE_IDS: Record<string, string> = {
  small: 'price_1Tt6NCDynIU5fZLWmKmTgIgB',
  medium: 'price_1Tt6NDDynIU5fZLWz6OfYSi5',
  large: 'price_1Tt6NEDynIU5fZLWeRe1q3MO',
  premium: 'price_1Tt6NFDynIU5fZLW2hpgTBst',
};
