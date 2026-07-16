import { NextRequest } from 'next/server';

/**
 * Extract auth token from request cookies.
 * Checks common cookie names used by the custom auth system.
 */
export function getAuthToken(request: NextRequest): string | null {
  const cookieNames = ['auth_token', 'session', 'token'];
  for (const name of cookieNames) {
    const value = request.cookies.get(name)?.value;
    if (value) return value;
  }
  return null;
}
