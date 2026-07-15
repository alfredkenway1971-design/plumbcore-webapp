/* ── Provincial/State Sales Tax Rates for Auto-Calculated Estimates ── */

// Canada: GST/HST/PST rates by province code
export const CANADA_TAX_RATES: Record<string, { rate: number; label: string }> = {
  AB: { rate: 0.05, label: 'GST 5%' },           // Alberta — GST only
  BC: { rate: 0.12, label: 'GST+PST 12%' },      // British Columbia
  MB: { rate: 0.12, label: 'GST+PST 12%' },      // Manitoba
  NB: { rate: 0.15, label: 'HST 15%' },           // New Brunswick
  NL: { rate: 0.15, label: 'HST 15%' },           // Newfoundland & Labrador
  NS: { rate: 0.15, label: 'HST 15%' },           // Nova Scotia
  NT: { rate: 0.05, label: 'GST 5%' },            // Northwest Territories
  NU: { rate: 0.05, label: 'GST 5%' },            // Nunavut
  ON: { rate: 0.13, label: 'HST 13%' },           // Ontario
  PE: { rate: 0.15, label: 'HST 15%' },           // Prince Edward Island
  QC: { rate: 0.14975, label: 'GST+QST 14.975%' },// Quebec
  SK: { rate: 0.11, label: 'GST+PST 11%' },      // Saskatchewan
  YT: { rate: 0.05, label: 'GST 5%' },            // Yukon
};

// US: Combined state + average local sales tax rates by state code
export const USA_TAX_RATES: Record<string, { rate: number; label: string }> = {
  AL: { rate: 0.0924, label: 'Tax 9.24%' },    // Alabama
  AK: { rate: 0.0176, label: 'Tax 1.76%' },    // Alaska
  AZ: { rate: 0.0825, label: 'Tax 8.25%' },    // Arizona
  AR: { rate: 0.0930, label: 'Tax 9.30%' },    // Arkansas
  CA: { rate: 0.0725, label: 'Tax 7.25%' },    // California (varies by county)
  CO: { rate: 0.0772, label: 'Tax 7.72%' },    // Colorado
  CT: { rate: 0.0635, label: 'Tax 6.35%' },    // Connecticut
  DE: { rate: 0.0000, label: 'Tax 0%' },       // Delaware — no sales tax
  FL: { rate: 0.0701, label: 'Tax 7.01%' },    // Florida
  GA: { rate: 0.0732, label: 'Tax 7.32%' },    // Georgia
  HI: { rate: 0.0444, label: 'Tax 4.44%' },    // Hawaii
  ID: { rate: 0.0603, label: 'Tax 6.03%' },    // Idaho
  IL: { rate: 0.0890, label: 'Tax 8.90%' },    // Illinois
  IN: { rate: 0.0700, label: 'Tax 7.00%' },    // Indiana
  IA: { rate: 0.0694, label: 'Tax 6.94%' },    // Iowa
  KS: { rate: 0.0867, label: 'Tax 8.67%' },    // Kansas
  KY: { rate: 0.0600, label: 'Tax 6.00%' },    // Kentucky
  LA: { rate: 0.0956, label: 'Tax 9.56%' },    // Louisiana
  ME: { rate: 0.0550, label: 'Tax 5.50%' },    // Maine
  MD: { rate: 0.0600, label: 'Tax 6.00%' },    // Maryland
  MA: { rate: 0.0625, label: 'Tax 6.25%' },    // Massachusetts
  MI: { rate: 0.0600, label: 'Tax 6.00%' },    // Michigan
  MN: { rate: 0.0788, label: 'Tax 7.88%' },    // Minnesota
  MS: { rate: 0.0707, label: 'Tax 7.07%' },    // Mississippi
  MO: { rate: 0.0825, label: 'Tax 8.25%' },    // Missouri
  MT: { rate: 0.0000, label: 'Tax 0%' },       // Montana — no sales tax
  NE: { rate: 0.0694, label: 'Tax 6.94%' },    // Nebraska
  NV: { rate: 0.0823, label: 'Tax 8.23%' },    // Nevada
  NH: { rate: 0.0000, label: 'Tax 0%' },       // New Hampshire
  NJ: { rate: 0.0663, label: 'Tax 6.63%' },    // New Jersey
  NM: { rate: 0.0790, label: 'Tax 7.90%' },    // New Mexico
  NY: { rate: 0.0888, label: 'Tax 8.88%' },    // New York
  NC: { rate: 0.0700, label: 'Tax 7.00%' },    // North Carolina
  ND: { rate: 0.0696, label: 'Tax 6.96%' },    // North Dakota
  OH: { rate: 0.0723, label: 'Tax 7.23%' },    // Ohio
  OK: { rate: 0.0895, label: 'Tax 8.95%' },    // Oklahoma
  OR: { rate: 0.0000, label: 'Tax 0%' },       // Oregon — no sales tax
  PA: { rate: 0.0600, label: 'Tax 6.00%' },    // Pennsylvania
  RI: { rate: 0.0700, label: 'Tax 7.00%' },    // Rhode Island
  SC: { rate: 0.0738, label: 'Tax 7.38%' },    // South Carolina
  SD: { rate: 0.0680, label: 'Tax 6.80%' },    // South Dakota
  TN: { rate: 0.0955, label: 'Tax 9.55%' },    // Tennessee
  TX: { rate: 0.0825, label: 'Tax 8.25%' },    // Texas
  UT: { rate: 0.0719, label: 'Tax 7.19%' },    // Utah
  VT: { rate: 0.0600, label: 'Tax 6.00%' },    // Vermont
  VA: { rate: 0.0575, label: 'Tax 5.75%' },    // Virginia
  WA: { rate: 0.0888, label: 'Tax 8.88%' },    // Washington
  WV: { rate: 0.0648, label: 'Tax 6.48%' },    // West Virginia
  WI: { rate: 0.0543, label: 'Tax 5.43%' },    // Wisconsin
  WY: { rate: 0.0536, label: 'Tax 5.36%' },    // Wyoming
  DC: { rate: 0.0600, label: 'Tax 6.00%' },    // Washington DC
};

/** Full province/state name → code lookup */
export const PROVINCE_CODES: Record<string, string> = {
  // Canada provinces (English + French names)
  'alberta': 'AB', 'ab': 'AB',
  'british columbia': 'BC', 'bc': 'BC', 'colombie-britannique': 'BC',
  'manitoba': 'MB', 'mb': 'MB',
  'new brunswick': 'NB', 'nb': 'NB', 'nouveau-brunswick': 'NB',
  'newfoundland': 'NL', 'nl': 'NL', 'newfoundland and labrador': 'NL', 'terre-neuve': 'NL',
  'nova scotia': 'NS', 'ns': 'NS', 'nouvelle-écosse': 'NS',
  'northwest territories': 'NT', 'nt': 'NT', 'territoires du nord-ouest': 'NT',
  'nunavut': 'NU', 'nu': 'NU',
  'ontario': 'ON', 'on': 'ON',
  'prince edward island': 'PE', 'pe': 'PE', 'île-du-prince-édouard': 'PE',
  'quebec': 'QC', 'qc': 'QC', 'québec': 'QC',
  'saskatchewan': 'SK', 'sk': 'SK',
  'yukon': 'YT', 'yt': 'YT',
  // US states
  'alabama': 'AL', 'al': 'AL',
  'alaska': 'AK', 'ak': 'AK',
  'arizona': 'AZ', 'az': 'AZ',
  'arkansas': 'AR', 'ar': 'AR',
  'california': 'CA', 'ca': 'CA',
  'colorado': 'CO', 'co': 'CO',
  'connecticut': 'CT', 'ct': 'CT',
  'delaware': 'DE', 'de': 'DE',
  'florida': 'FL', 'fl': 'FL',
  'georgia': 'GA', 'ga': 'GA',
  'hawaii': 'HI', 'hi': 'HI',
  'idaho': 'ID', 'id': 'ID',
  'illinois': 'IL', 'il': 'IL',
  'indiana': 'IN', 'in': 'IN',
  'iowa': 'IA', 'ia': 'IA',
  'kansas': 'KS', 'ks': 'KS',
  'kentucky': 'KY', 'ky': 'KY',
  'louisiana': 'LA', 'la': 'LA',
  'maine': 'ME', 'me': 'ME',
  'maryland': 'MD', 'md': 'MD',
  'massachusetts': 'MA', 'ma': 'MA',
  'michigan': 'MI', 'mi': 'MI',
  'minnesota': 'MN', 'mn': 'MN',
  'mississippi': 'MS', 'ms': 'MS',
  'missouri': 'MO', 'mo': 'MO',
  'montana': 'MT', 'mt': 'MT',
  'nebraska': 'NE', 'ne': 'NE',
  'nevada': 'NV', 'nv': 'NV',
  'new hampshire': 'NH', 'nh': 'NH',
  'new jersey': 'NJ', 'nj': 'NJ',
  'new mexico': 'NM', 'nm': 'NM',
  'new york': 'NY', 'ny': 'NY',
  'north carolina': 'NC', 'nc': 'NC',
  'north dakota': 'ND', 'nd': 'ND',
  'ohio': 'OH', 'oh': 'OH',
  'oklahoma': 'OK', 'ok': 'OK',
  'oregon': 'OR', 'or': 'OR',
  'pennsylvania': 'PA', 'pa': 'PA',
  'rhode island': 'RI', 'ri': 'RI',
  'south carolina': 'SC', 'sc': 'SC',
  'south dakota': 'SD', 'sd': 'SD',
  'tennessee': 'TN', 'tn': 'TN',
  'texas': 'TX', 'tx': 'TX',
  'utah': 'UT', 'ut': 'UT',
  'vermont': 'VT', 'vt': 'VT',
  'virginia': 'VA', 'va': 'VA',
  'washington': 'WA', 'wa': 'WA',
  'west virginia': 'WV', 'wv': 'WV',
  'wisconsin': 'WI', 'wi': 'WI',
  'wyoming': 'WY', 'wy': 'WY',
  'district of columbia': 'DC', 'dc': 'DC',
};

/**
 * Get tax rate for a given state/province and country.
 * Falls back to 8.5% if the state isn't found.
 */
export function getTaxRate(state: string, country: string): { rate: number; label: string } {
  if (!state) return { rate: 0.085, label: 'Tax 8.5%' };

  const code = state.length <= 2 ? state.toUpperCase() : (PROVINCE_CODES[state.toLowerCase().trim()] || '');

  if (country === 'CA' && CANADA_TAX_RATES[code]) {
    return CANADA_TAX_RATES[code];
  }
  if (country === 'US' && USA_TAX_RATES[code]) {
    return USA_TAX_RATES[code];
  }

  // Default fallback
  if (country === 'CA') return { rate: 0.13, label: 'HST 13%' };
  return { rate: 0.085, label: 'Tax 8.5%' };
}
