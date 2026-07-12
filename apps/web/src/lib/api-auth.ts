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
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7);
  const session = decodeSessionToken(token);
  if (!session) return null;
  return {
    userId: session.user.id,
    email: session.user.email,
    companyId: session.profile.company_id,
    role: session.profile.role,
  };
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
