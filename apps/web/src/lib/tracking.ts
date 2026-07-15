/**
 * Generate a short, readable tracking number for customer leads.
 * Format: PC-XXXXXX (e.g. PC-A7K3M2)
 * 6 alphanumeric chars = ~2 billion combinations, no ambiguous chars (0, O, I, L)
 */
export function generateTrackingToken(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PC-${result}`;
}

/**
 * Validate a tracking token format
 */
export function isValidTrackingToken(token: string): boolean {
  return /^PC-[A-HJ-NP-Z2-9]{6}$/.test(token);
}
