/**
 * Middleware — Server-side route protection
 * Protects /dashboard/* and /admin/* routes
 * Redirects unauthenticated users to /login
 * Redirects non-admin users away from /admin/*
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeSessionToken } from '@/lib/custom-auth';

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/admin'];

// Routes that don't require auth (already authenticated users might land here)
const AUTH_ROUTES = ['/login', '/signup', '/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip public routes
  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));
  
  if (!isProtected && !isAuthRoute) {
    return NextResponse.next();
  }

  // Extract token from cookie or Authorization header
  let token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
  }

  if (!token) {
    // No token at all
    if (isProtected) {
      return redirectToLogin(request);
    }
    // Allow access to auth pages even without token
    return NextResponse.next();
  }

  // Decode and verify the HMAC-signed token
  const session = decodeSessionToken(token);
  
  if (!session) {
    // Token is invalid or expired
    if (isProtected) {
      return redirectToLogin(request);
    }
    return NextResponse.next();
  }

  // If user is on an auth page but already authenticated, redirect to dashboard
  if (isAuthRoute && session.user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Check admin access
  const isAdminRoute = pathname.startsWith('/admin');
  const role = session.profile?.role || '';
  const isAdmin = role === 'super_admin' || role === 'admin';

  if (isAdminRoute && !isAdmin) {
    // Non-admin trying to access admin — redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Add user info to request headers for downstream API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', session.user.id);
  requestHeaders.set('x-user-email', session.user.email);
  requestHeaders.set('x-user-role', role);
  requestHeaders.set('x-company-id', session.company?.id || '');

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    // Match all dashboard and admin routes, plus auth routes
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/signup',
    '/reset-password',
  ],
};
