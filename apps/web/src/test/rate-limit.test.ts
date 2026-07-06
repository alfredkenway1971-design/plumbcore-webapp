import { describe, it, expect } from 'vitest';
import { checkRateLimit, RATE_LIMITS } from '../lib/rate-limit';

describe('Rate Limiter', () => {
  it('allows first request', () => {
    const result = checkRateLimit('test-key', { max: 5, windowSeconds: 60 });
    expect(result.allowed).toBe(true);
  });

  it('blocks after exceeding limit', () => {
    const key = 'test-block-' + Date.now();
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key, { max: 5, windowSeconds: 60 });
    }
    const result = checkRateLimit(key, { max: 5, windowSeconds: 60 });
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.retryAfter).toBeGreaterThan(0);
    }
  });

  it('has correct defaults', () => {
    expect(RATE_LIMITS.login.max).toBe(10);
    expect(RATE_LIMITS.signup.max).toBe(5);
    expect(RATE_LIMITS.checkout.max).toBe(10);
  });
});
