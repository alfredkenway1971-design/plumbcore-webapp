/* ── PlumbCore 3-Tier Pricing & Plan Features ── */

export const PLAN_PRICES: Record<string, number> = {
  solo: 34900,       // $349/mo
  pro: 79900,        // $799/mo
  business: 149900,  // $1,499/mo
  enterprise: 0,     // Contact us
};

export const PLAN_LABELS: Record<string, string> = {
  solo: 'Solo',
  pro: 'Pro',
  business: 'Business',
  enterprise: 'Enterprise',
};

export const PLAN_LABELS_PRETTY: Record<string, string> = {
  solo: 'Solo',
  pro: 'Pro',
  business: 'Business',
  enterprise: 'Enterprise (Custom)',
};

export const PLAN_LEAD_FEES: Record<string, number> = {
  solo: 1500,    // $15/lead
  pro: 1000,     // $10/lead
  business: 500, // $5/lead
  enterprise: 0, // $0 (API fee instead)
};

export const PLAN_MAX_TECHS: Record<string, number> = {
  solo: 1,
  pro: 10,
  business: 25,
  enterprise: 999,
};

export const PLAN_AI_RECEPTIONIST_HOURS: Record<string, number> = {
  solo: 15,
  pro: 60,
  business: 150,
  enterprise: 999,
};

export const PLAN_DESCRIPTIONS: Record<string, string> = {
  solo: 'Best for owner-operators and solo plumbers',
  pro: 'For growing shops with 2-10 techs',
  business: 'For scaling companies with 11-25 techs',
  enterprise: '25+ techs with custom everything',
};

export const PLAN_FEATURES: Record<string, string[]> = {
  solo: [
    'Shared lead marketplace access',
    'Unlimited AI photo estimates',
    '15 hrs/mo AI receptionist',
    'Job scheduling & dispatch',
    'Invoicing & payments',
    'Basic analytics',
  ],
  pro: [
    'Everything in Solo, plus:',
    'Up to 10 techs',
    'Your own subdomain quote page',
    '60 hrs/mo AI receptionist',
    'Lower lead fees ($10/job)',
    'Route optimization',
    'Team management',
    'Premium analytics',
  ],
  business: [
    'Everything in Pro, plus:',
    'Up to 25 techs',
    'Embed quote page on your website',
    '150 hrs/mo AI receptionist',
    'Lowest lead fees ($5/job)',
    'Inventory tracking',
    'Customer portal',
    'White-label branding',
    'Priority support',
  ],
  enterprise: [
    'Everything in Business, plus:',
    'Unlimited techs',
    'Full API access',
    'Custom integrations',
    'Dedicated account manager',
    '$0 lead fees (API fee model)',
    'Custom SLA',
    'On-premise option',
  ],
};

export const PLAN_STRIPE_PRICE_IDS: Record<string, string> = {
  solo: 'price_1TrEh8D0AAcByeQ9hCRJDqHs',
  pro: 'price_1TrEhCD0AAcByeQ9ERNDiEHS',
  business: 'price_1TrEhED0AAcByeQ9yyeuUONo',
};

export const PLAN_LEAD_LIMITS: Record<string, number> = {
  solo: 40,
  pro: 80,
  business: 200,
  enterprise: 9999,
};

export function getPlanTierFromPriceId(priceId: string): string {
  const map: Record<string, string> = {
    'price_1TrEh8D0AAcByeQ9hCRJDqHs': 'solo',
    'price_1TrEhCD0AAcByeQ9ERNDiEHS': 'pro',
    'price_1TrEhED0AAcByeQ9yyeuUONo': 'business',
    'price_1TqFwHD0AAcByeQ9qNUaikbx': 'solo',
    'price_1TqFwOD0AAcByeQ94DnPlHr1': 'pro',
    'price_1TqFwPD0AAcByeQ9SjTdf8VF': 'pro',
    'price_1TqFwVD0AAcByeQ90c6KWdEJ': 'business',
    'price_1TqFwXD0AAcByeQ9vJ2OGA8G': 'enterprise',
  };
  return map[priceId] || 'solo';
}

/* ── Revenue Model (for reference) ── */
/*
Assumed Distribution @ 100 Plumbers:
  Solo:  40 plumbers × $349 = $13,960/mo SaaS + 320 jobs × $49 = $29,640/mo total
  Pro:   45 plumbers × $799 = $35,955/mo SaaS + 360 jobs × $49 = $53,595/mo total
  Biz:   15 plumbers × $1,499 = $22,485/mo SaaS + 120 jobs × $49 = $28,365/mo total
         ───────────────────────────────────────────────────────────────
         Total: $72,400/mo SaaS + $39,200/mo lead fees = $111,600/mo
*/
