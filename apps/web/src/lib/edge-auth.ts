/**
 * Edge-compatible token decode — no Node.js crypto dependency
 * Uses Web Crypto API (crypto.subtle) which works in Edge Runtime
 */
export interface EdgeAuthSession {
  user: { id: string; email: string };
  profile?: {
    id: string;
    company_id: string;
    email: string;
    full_name: string;
    phone: string;
    role: string;
    is_active: boolean;
  };
  company?: {
    id: string;
    slug: string;
    name: string;
    timezone: string;
    subscription_tier: string;
    subscription_status: string;
    stripe_customer_id: string;
    stripe_subscription_id: string;
    onboarding_complete: boolean;
  };
  iat: number;
  exp: number;
}

/**
 * Decode and verify an HMAC-SHA256 signed JWT using Web Crypto API
 * Compatible with Next.js Edge Middleware Runtime
 */
export async function decodeSessionTokenEdge(token: string): Promise<EdgeAuthSession | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const authSecret = process.env.AUTH_SECRET || '';

    if (!authSecret) return null;

    // Import the secret key for HMAC verification using Web Crypto
    const encoder = new TextEncoder();
    const keyData = encoder.encode(authSecret);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Verify signature
    const sigBytes = Uint8Array.from(atob(signature.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const dataBytes = encoder.encode(`${header}.${body}`);
    const isValid = await crypto.subtle.verify('HMAC', cryptoKey, sigBytes, dataBytes);

    if (!isValid) return null;

    // Decode payload
    const payload = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(body.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
      )
    );

    if (payload.exp && payload.exp < Date.now()) return null;

    return payload as EdgeAuthSession;
  } catch {
    return null;
  }
}
