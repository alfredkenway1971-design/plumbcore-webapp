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
  solo: 0,    // $49 flat deposit per lead — PlumbCore keeps 100%
  pro: 0,     // Same flat rate across all plans
  business: 0, // Lead fee = $49, deducted from customer's deposit
  enterprise: 0,
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
    'Lead marketplace access (flat $49/lead)',
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
    'Lead marketplace ($49/lead flat)',
    'Route optimization',
    'Team management',
    'Premium analytics',
  ],
  business: [
    'Everything in Pro, plus:',
    'Up to 25 techs',
    'Embed quote page on your website',
    '150 hrs/mo AI receptionist',
    'Lead marketplace ($49/lead flat)',
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
    '$0 lead fees (API model)',
    'Custom SLA',
    'On-premise option',
  ],
};

export const PLAN_STRIPE_PRICE_IDS: Record<string, string> = {
  solo: 'price_1Tt6HsDynIU5fZLWP1DRWDud',
  pro: 'price_1Tt6HtDynIU5fZLWHSiADfxM',
  business: 'price_1Tt6HtDynIU5fZLWkjEeHFOP',
};

export const PLAN_LEAD_LIMITS: Record<string, number> = {
  solo: 40,
  pro: 80,
  business: 200,
  enterprise: 9999,
};

export function getPlanTierFromPriceId(priceId: string): string {
  const map: Record<string, string> = {
    'price_1Tt6HsDynIU5fZLWP1DRWDud': 'solo',
    'price_1Tt6HtDynIU5fZLWHSiADfxM': 'pro',
    'price_1Tt6HtDynIU5fZLWkjEeHFOP': 'business',
  };
  return map[priceId] || 'solo';
}

/* ── Tiered Deposit Model (used by quote page) ── */
export const DEPOSIT_TIERS = [
  { max: 1000, deposit: 4900, label: 'Under $1,000', tier: 'small' },
  { max: 1500, deposit: 9900, label: '$1,000 – $1,499', tier: 'medium' },
  { max: 2000, deposit: 14900, label: '$1,500 – $1,999', tier: 'large' },
  { max: Infinity, deposit: 19900, label: '$2,000+', tier: 'premium' },
];

export function calcDeposit(estimatedPrice: number): { deposit: number; tier: string } {
  for (const t of DEPOSIT_TIERS) {
    if (estimatedPrice < t.max) {
      return { deposit: t.deposit, tier: t.label };
    }
  }
  return { deposit: 19900, tier: '$2,000+' };
}

export function depositDollars(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

/* ── Revenue Model (for reference) ── */
/*
Revenue Model (@ 100 plumbers):
  Plumber pays: SaaS subscription ($349/$799/$1,499/mo)
  Customer pays: deposit based on estimate tier ($49–$199, kept 100% by PlumbCore)
  Plumber invoices customer directly for job — no revenue split

  Deposit tiers: Under $1K = $49 | $1K–$1.5K = $99 | $1.5K–$2K = $149 | $2K+ = $199

  Solo:  40 × $349 = $13,960/mo + 320 leads × avg $62 = $19,840/mo
  Pro:   45 × $799 = $35,955/mo + 360 leads × avg $62 = $22,320/mo
  Biz:   15 × $1,499 = $22,485/mo + 120 leads × avg $62 = $7,440/mo
         ──────────────────────────────────────────────────
         Total: $72,400/mo SaaS + $49,600/mo lead fees = $122,000/mo
*/
