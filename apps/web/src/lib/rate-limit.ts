/**
 * Simple in-memory rate limiter
 * 
 * Note: Resets on Vercel cold starts. For production with persistent
 * rate limiting, upgrade to Upstash Redis or Vercel KV.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  max: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

const DEFAULTS: RateLimitConfig = { max: 20, windowSeconds: 60 };

/**
 * Check if a request is rate limited.
 * Returns { allowed: true } or { allowed: false, retryAfter: number }
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = DEFAULTS
): { allowed: true } | { allowed: false; retryAfter: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + config.windowSeconds * 1000 });
    return { allowed: true };
  }

  entry.count++;

  if (entry.count > config.max) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  return { allowed: true };
}

/**
 * Get client IP from request
 */
export function getClientIP(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

/**
 * Standard rate limit configs per endpoint
 */
export const RATE_LIMITS = {
  login: { max: 10, windowSeconds: 60 },       // 10 attempts per minute
  signup: { max: 5, windowSeconds: 300 },        // 5 signups per 5 minutes
  resetPassword: { max: 3, windowSeconds: 300 }, // 3 reset requests per 5 minutes
  checkout: { max: 10, windowSeconds: 60 },       // 10 checkout creations per minute
  default: { max: 30, windowSeconds: 60 },        // 30 requests per minute general
} as const;
