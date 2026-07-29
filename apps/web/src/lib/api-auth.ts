/**
 * Auth middleware for API routes
 * Extracts and verifies JWT from Authorization header
 */
import { NextResponse } from 'next/server';
import { decodeSessionToken } from './custom-auth';

export interface AuthenticatedRequest {
  userId: string;
  email: string;
  companyId: string;
  role: string;
}

export function getAuthFromRequest(req: Request): AuthenticatedRequest | null {
  // First try Authorization header (client-side API calls)
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const session = decodeSessionToken(token);
    if (session) {
      return {
        userId: session.user.id,
        email: session.user.email,
        companyId: session.profile.company_id,
        role: session.profile.role,
      };
    }
  }
  
  // Fallback: middleware-set headers (server-side, edge middleware already verified)
  const userId = req.headers.get('x-user-id');
  const email = req.headers.get('x-user-email');
  const companyId = req.headers.get('x-company-id');
  const role = req.headers.get('x-user-role');
  
  if (userId) {
    return {
      userId,
      email: email || '',
      companyId: companyId || '',
      role: role || '',
    };
  }
  
  return null;
}

export function unauthorized(): NextResponse {
  return NextResponse.json(
    { error: 'Authentication required' },
    { status: 401 }
  );
}

export function requireAuth(req: Request): AuthenticatedRequest | NextResponse {
  const auth = getAuthFromRequest(req);
  if (!auth) {
    return unauthorized();
  }
  return auth;
}
